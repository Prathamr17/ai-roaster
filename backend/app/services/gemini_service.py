import asyncio
import json
import logging
import random
from typing import List, Optional

from pydantic import BaseModel, Field

from app.config import settings
from app.core.errors import ApiError

logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:  # pragma: no cover
    genai = None
    genai_types = None

_client = genai.Client(api_key=settings.gemini_api_key) if (genai and settings.gemini_api_key) else None


class _ScoreBreakdownModel(BaseModel):
    keywords: float = Field(ge=0, le=25)
    formatting: float = Field(ge=0, le=25)
    impact: float = Field(ge=0, le=25)
    clarity: float = Field(ge=0, le=25)


class _IssueModel(BaseModel):
    title: str
    severity: str  # low | medium | high
    explanation: str
    fix: str


class _StrengthModel(BaseModel):
    title: str
    evidence: str


class _BulletRewriteModel(BaseModel):
    section: str
    original: str
    rewritten: str
    rationale: str


class _AnalysisModel(BaseModel):
    ats_score: float = Field(ge=0, le=100, alias="atsScore")
    score_breakdown: _ScoreBreakdownModel = Field(alias="scoreBreakdown")
    issues: List[_IssueModel] = Field(min_length=1)
    strengths: List[_StrengthModel] = Field(min_length=1)
    bullet_rewrites: List[_BulletRewriteModel] = Field(default_factory=list, alias="bulletRewrites")
    keywords_present: List[str] = Field(default_factory=list, alias="keywordsPresent")
    keywords_missing: List[str] = Field(default_factory=list, alias="keywordsMissing")
    summary: str

    class Config:
        populate_by_name = True


def _build_prompt(raw_text: str, target_role: Optional[str]) -> str:
    return "\n".join(
        [
            "You are a senior technical recruiter and ATS expert reviewing a resume.",
            f"Target Role / Job Description:\n{target_role}." if target_role
            else "No specific target role or job description was provided - assess for general ATS best practices and the apparent role.",
            "",
            "Score the resume from 0-100 based on ATS readiness across 4 axes (each 0 to 25 points):",
            "- keywords (0-25): Match of key technical skills, tools, frameworks, and job-specific terminology against the target role.",
            "- formatting (0-25): ATS parseability, clean standard section headers (EXPERIENCE, SKILLS, EDUCATION, PROJECTS), clean bullet structure, absence of layout errors.",
            "- impact (0-25): Strong action verbs, quantified achievements (%, $, scale, metrics), and measurable results.",
            "- clarity (0-25): Concise phrasing, active voice, professional sentence structure, and high readability.",
            "",
            "EVALUATION CRITERIA FOR SCORE BREAKDOWN:",
            "- High formatting score (20-25): Clean, standard section headers, bullet lists, consistent structure.",
            "- High impact score (20-25): Bullet points featuring quantified metrics, achievements, and strong action verbs.",
            "- High clarity score (20-25): Clear, concise, and professional bullet points.",
            "- compute ats_score strictly as the sum of keywords + formatting + impact + clarity.",
            "",
            "Return exactly 5 prioritized issues, 5 standout strengths, and 5-10 weak bullets rewritten to be stronger, quantified, and ATS-friendly.",
            "Rewrites must preserve the original meaning. Each rewrite needs a one-line rationale.",
            "Identify keywords clearly present and notable keywords missing from the target job description / target role.",
            "Be specific and evidence-based - cite phrasing from the resume in explanations.",
            "",
            "RESUME TEXT:",
            "--------",
            raw_text,
            "--------",
        ]
    )



class AnalysisResult(BaseModel):
    analysis: _AnalysisModel
    model: str
    prompt_tokens: Optional[int] = None
    response_tokens: Optional[int] = None


def _get_model_candidates() -> List[str]:
    return settings.fallback_models


async def _call_gemini(prompt: str, model: str):
    result = await _client.aio.models.generate_content(
        model=model,
        contents=prompt,
        config=genai_types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_AnalysisModel,
            temperature=0.4,
        ),
    )
    text = result.text
    if not text:
        raise ValueError("Empty response from Gemini")
    usage = getattr(result, "usage_metadata", None)
    return text, usage


async def analyze_resume(raw_text: str, target_role: Optional[str]) -> AnalysisResult:
    if not _client:
        raise ApiError.internal("GEMINI_API_KEY is not configured on the server.")

    prompt = _build_prompt(raw_text, target_role)
    models_to_try = _get_model_candidates()
    last_err: Optional[Exception] = None

    for model_name in models_to_try:
        for attempt in range(1, 3):
            try:
                text, usage = await _call_gemini(prompt, model=model_name)
                parsed = json.loads(text)
                validated = _AnalysisModel.model_validate(parsed)
                return AnalysisResult(
                    analysis=validated,
                    model=model_name,
                    prompt_tokens=getattr(usage, "prompt_token_count", None) if usage else None,
                    response_tokens=getattr(usage, "candidates_token_count", None) if usage else None,
                )
            except Exception as err:  # noqa: BLE001
                last_err = err
                err_str = str(err)
                logger.warning(
                    "Gemini analysis attempt %d failed for model %s: %s",
                    attempt,
                    model_name,
                    err,
                )
                is_transient = "503" in err_str or "UNAVAILABLE" in err_str or "429" in err_str
                if is_transient and attempt < 2:
                    await asyncio.sleep(1.5 * attempt + random.uniform(0.2, 0.5))
                    continue
                # If error is not transient or second attempt failed, fall back to next model
                break

    if last_err and ("503" in str(last_err) or "UNAVAILABLE" in str(last_err)):
        raise ApiError.unavailable(f"Gemini service is experiencing high demand. Please try again later: {last_err}")
    raise ApiError.internal(f"Gemini analysis failed: {last_err}")
