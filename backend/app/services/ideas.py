"""Build prompts and generate startup ideas for modes B (favorites),
C (free generation), and D (industry-targeted)."""

from app.models import Startup
from app.services.llm import chat

LANGUAGE_NAMES = {"ru": "Russian", "en": "English"}

SYSTEM_PROMPT = (
    "You are a sharp startup ideation partner. You generate concrete, original "
    "startup ideas.\n\n"
    "CRITICAL OUTPUT RULES:\n"
    "- Output ONLY the final ideas. Never show your reasoning, planning, "
    "deliberation, or meta commentary about the task or formatting.\n"
    "- Do not write phrases like 'We need to', 'Let me', 'Assume', or describe "
    "what you are about to do. Just produce the result directly.\n\n"
    "For each idea provide: a short name, a one-line pitch, the target user, "
    "and the core mechanism. Be specific, avoid generic buzzwords.\n\n"
    "FORMAT (clean GitHub-flavored Markdown, no surrounding code block):\n"
    "## <Idea name>\n"
    "**Pitch:** <one line>\n"
    "**Target user:** <one line>\n"
    "**Mechanism:** <one or two lines>"
)


def _slider_guidance(creativity: int, absurdity: int) -> str:
    parts = []
    if creativity >= 70:
        parts.append("Push for bold, non-obvious ideas.")
    elif creativity <= 30:
        parts.append("Keep ideas practical and grounded.")
    if absurdity >= 70:
        parts.append("Embrace wild, even absurd concepts — surprise me.")
    elif absurdity <= 20:
        parts.append("Keep ideas realistic and feasible.")
    return " ".join(parts)


def _format_startups(startups: list[Startup]) -> str:
    lines = []
    for s in startups:
        tagline = s.tagline or s.description[:120]
        lines.append(f"- {s.name} ({s.batch}): {tagline}")
    return "\n".join(lines)


def build_prompt(
    mode: str,
    count: int,
    creativity: int,
    absurdity: int,
    industry: str | None,
    favorites: list[Startup] | None,
    language: str,
) -> str:
    guidance = _slider_guidance(creativity, absurdity)
    lang_name = LANGUAGE_NAMES.get(language, "Russian")
    footer = (
        f"\n\nGenerate {count} distinct startup idea(s). "
        f"Number them. {guidance} "
        f"Write the entire response in {lang_name}."
    )

    if mode == "B":
        context = _format_startups(favorites or [])
        return (
            "Here are startups a user finds interesting:\n"
            f"{context}\n\n"
            "Propose new startup ideas inspired by the patterns, markets, and "
            "approaches in these companies — not copies, but adjacent or novel "
            "directions." + footer
        )
    if mode == "D":
        return (
            f"Generate startup ideas in this domain/industry: {industry}." + footer
        )
    # mode C
    return (
        "Generate fresh startup ideas across any domain you find promising."
        + footer
    )


def generate_ideas(
    mode: str,
    count: int,
    creativity: int,
    absurdity: int,
    industry: str | None = None,
    favorites: list[Startup] | None = None,
    language: str = "ru",
) -> str:
    prompt = build_prompt(
        mode, count, creativity, absurdity, industry, favorites, language
    )
    return chat(SYSTEM_PROMPT, prompt, creativity=creativity, absurdity=absurdity)
