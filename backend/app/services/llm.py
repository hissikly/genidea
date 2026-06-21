"""Thin client around the OpenRouter chat-completions API (Qwen model)."""

import httpx

from app.config import settings


class LLMError(Exception):
    pass


def _temperature_from_creativity(creativity: int, absurdity: int) -> float:
    """Map sliders to temperature. Capped at 1.25: above that the model loses
    coherence and leaks its reasoning instead of producing a clean answer."""
    blended = creativity * 0.6 + absurdity * 0.4
    return round(0.3 + (blended / 100) * 0.95, 2)


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
        "top_p": 0.9,
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
        content = data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as exc:
        raise LLMError(f"Unexpected OpenRouter response: {data}") from exc

    return _clean_output(content)


def _clean_output(text: str) -> str:
    """Strip a code-block fence if the model wrapped the whole answer in one."""
    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        stripped = "\n".join(lines).strip()
    return stripped
