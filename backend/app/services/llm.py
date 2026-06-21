"""Thin client around the OpenRouter chat-completions API (Qwen model)."""

import httpx

from app.config import settings


class LLMError(Exception):
    pass


def _temperature_from_creativity(creativity: int, absurdity: int) -> float:
    """Map 0-100 creativity/absurdity sliders to a sampling temperature (0-2)."""
    blended = creativity * 0.6 + absurdity * 0.4
    return round(0.2 + (blended / 100) * 1.6, 2)


def chat(
    system_prompt: str,
    user_prompt: str,
    creativity: int = 50,
    absurdity: int = 20,
) -> str:
    if not settings.openrouter_api_key:
        raise LLMError("OPENROUTER_API_KEY is not configured.")

    payload = {
        "model": settings.openrouter_model,
        "temperature": _temperature_from_creativity(creativity, absurdity),
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=120.0) as client:
            resp = client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as exc:
        raise LLMError(
            f"OpenRouter error {exc.response.status_code}: {exc.response.text[:300]}"
        ) from exc
    except httpx.HTTPError as exc:
        raise LLMError(f"OpenRouter request failed: {exc}") from exc

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as exc:
        raise LLMError(f"Unexpected OpenRouter response: {data}") from exc
