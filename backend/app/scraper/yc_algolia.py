"""Fetch YC companies via the public Algolia search index used by ycombinator.com.

The Algolia search-only key embedded on ycombinator.com is rotated and has an
expiry baked in, so we scrape the current key from the public site instead of
relying solely on a hardcoded one. settings.search_api_key is used as fallback.
"""

import base64
import json
import re
from urllib.parse import quote

import httpx

from app.config import settings

# Algolia limits standard pagination to 1000 hits total, so we fetch the full
# index batch-by-batch (each YC batch has far fewer than 1000 companies).
HITS_PER_PAGE = 1000
YC_COMPANIES_URL = "https://www.ycombinator.com/companies"
_KEY_RE = re.compile(r"[A-Za-z0-9+/=]{120,}")


def _algolia_url() -> str:
    return (
        f"https://{settings.search_app_id.lower()}-dsn.algolia.net"
        f"/1/indexes/{settings.yc_index}/query"
    )


def fetch_live_api_key(client: httpx.Client) -> str:
    """Scrape the current Algolia search-only key from the YC companies page."""
    resp = client.get(YC_COMPANIES_URL)
    resp.raise_for_status()
    for candidate in _KEY_RE.findall(resp.text):
        try:
            decoded = base64.b64decode(candidate).decode("utf-8", "ignore")
        except Exception:
            continue
        if "YCCompany" in decoded:
            return candidate
    raise RuntimeError("Could not locate YC Algolia search key on the page.")


def _headers(api_key: str) -> dict:
    return {
        "X-Algolia-Application-Id": settings.search_app_id,
        "X-Algolia-API-Key": api_key,
        "Content-Type": "application/json",
    }


def _batch_to_year(batch: str) -> int | None:
    """Convert a batch like 'Winter 2009', 'W24' or 'S2023' to a 4-digit year."""
    if not batch:
        return None
    m = re.search(r"(\d{4})", batch)
    if m:
        return int(m.group(1))
    m = re.search(r"\b[WSF](\d{2})\b", batch)
    if m:
        return 2000 + int(m.group(1))
    return None


def _normalize(hit: dict) -> dict:
    batch = hit.get("batch") or ""
    locations = hit.get("all_locations") or hit.get("location") or ""
    if isinstance(locations, list):
        locations = ", ".join(locations)
    return {
        "yc_id": hit.get("id") or hit.get("objectID"),
        "name": hit.get("name") or "",
        "tagline": hit.get("one_liner") or hit.get("tagline") or "",
        "description": hit.get("long_description") or hit.get("one_liner") or "",
        "website": hit.get("website") or "",
        "batch": batch,
        "year": _batch_to_year(batch),
        "status": hit.get("status") or "",
        "team_size": hit.get("team_size"),
        "location": locations,
        "tags": hit.get("tags") or [],
        "industries": hit.get("industries") or [],
        "logo_url": hit.get("small_logo_thumb_url") or "",
    }


def _query(client: httpx.Client, api_key: str, params: str) -> dict:
    resp = client.post(
        _algolia_url(), headers=_headers(api_key), json={"params": params}
    )
    resp.raise_for_status()
    return resp.json()


def _fetch_batch_names(client: httpx.Client, api_key: str) -> list[str]:
    params = "query=&hitsPerPage=0&facets=%5B%22batch%22%5D&maxValuesPerFacet=1000"
    data = _query(client, api_key, params)
    return list(data.get("facets", {}).get("batch", {}).keys())


def fetch_all_companies() -> list[dict]:
    """Fetch every YC company by paging through each batch facet."""
    results: list[dict] = []
    seen: set = set()
    with httpx.Client(timeout=30.0, follow_redirects=True) as client:
        try:
            api_key = fetch_live_api_key(client)
        except Exception:
            api_key = settings.search_api_key

        batches = _fetch_batch_names(client, api_key)
        for batch in batches:
            facet = quote(json.dumps([[f"batch:{batch}"]]))
            page = 0
            while True:
                params = (
                    f"query=&hitsPerPage={HITS_PER_PAGE}"
                    f"&page={page}&facetFilters={facet}"
                )
                data = _query(client, api_key, params)
                hits = data.get("hits", [])
                for h in hits:
                    yc_id = h.get("id") or h.get("objectID")
                    if not h.get("name") or yc_id in seen:
                        continue
                    seen.add(yc_id)
                    results.append(_normalize(h))

                nb_pages = data.get("nbPages", 1)
                page += 1
                if page >= nb_pages or not hits:
                    break
    return results
