import asyncio
import json
import logging
import random
import re
from typing import List, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

from app.config import settings
from app.models.sections import (
    Basics,
    CertificationItem,
    EducationItem,
    ExperienceItem,
    Link,
    ParsedSections,
    ProjectItem,
)

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:  # pragma: no cover - library optional until configured
    genai = None
    genai_types = None

_client = genai.Client(api_key=settings.gemini_api_key) if (genai and settings.gemini_api_key) else None


# --- Gemini structured-output schema (mirrors the Zod validator) ---------

class _LinkModel(BaseModel):
    label: Optional[str] = None
    url: Optional[str] = None


class _BasicsModel(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    links: Optional[List[_LinkModel]] = None


class _ExperienceModel(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    bullets: Optional[List[str]] = None


class _EducationModel(BaseModel):
    degree: Optional[str] = None
    school: Optional[str] = None
    location: Optional[str] = None
    period: Optional[str] = None
    details: Optional[str] = None


class _ProjectModel(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    period: Optional[str] = None
    tech: Optional[List[str]] = None
    links: Optional[List[_LinkModel]] = None
    bullets: Optional[List[str]] = None


class _CertificationModel(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None


class _ParsedResumeModel(BaseModel):
    basics: Optional[_BasicsModel] = None
    summary: Optional[str] = None
    experience: Optional[List[_ExperienceModel]] = None
    education: Optional[List[_EducationModel]] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[_ProjectModel]] = None
    certifications: Optional[List[_CertificationModel]] = None
    languages: Optional[List[str]] = None
    interests: Optional[List[str]] = None


def _build_prompt(raw_text: str) -> str:
    return "\n".join(
        [
            "You are an expert resume parser extracting high-fidelity structured data from PDF text.",
            "",
            "Extract structured data while maintaining MAXIMAL VERBATIM DATA QUALITY:",
            "- basics: name, professional title, location, email, phone, social links (LinkedIn / GitHub / portfolio etc.; with labels and full URLs)",
            "- summary: full professional summary paragraph (rejoin if split across lines)",
            "- experience: jobs most recent first, with exact role (job title), company, period (preserve date format), location if available, optional role description paragraph, and ALL bullet points verbatim",
            "- education: degree, school, period, location, details (e.g. CGPA, final year project)",
            "- skills: flat array of technical skills (preserve category prefix if present e.g. 'Languages: Java, Python', 'Backend: Spring Boot...')",
            "- projects: EXACT FULL project title (e.g. 'MediCompare - Healthcare Price Transparency Platform', do NOT truncate or simplify), period if present, overview description paragraph, tech stack tags array, links array, and ALL bullet points verbatim",
            "- certifications: name, issuer, year",
            "- languages: flat array",
            "- interests: flat array",
            "",
            "CRITICAL RULES FOR HIGH DATA QUALITY:",
            "- Preserve exact full titles, project names, company names, and date ranges verbatim.",
            "- Do NOT summarize, truncate, simplify, or drop bullet points or descriptions.",
            "- Extract every bullet point verbatim under its respective experience or project entry.",
            "- Each experience/project bullet should read as a complete sentence.",
            "",
            "RESUME TEXT:",
            "--------",
            raw_text,
            "--------",
        ]
    )


EMPTY = ParsedSections()

_BULLET_PREFIX_RE = re.compile(r"^[\u2022\u2023\u25B6\u25C0\u25E6\u25A0\u25A1\u2219\u25AA\u25AB\u2013\u2014\-*\s]+")

_KNOWN_KEYWORDS = [
    "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Golang", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala",
    "React", "React.js", "Vue", "Vue.js", "Angular", "Next.js", "Node.js", "Express", "Express.js", "Flask", "FastAPI", "Django",
    "Spring", "Spring Boot", "HTML", "HTML5", "CSS", "CSS3", "Tailwind", "Tailwind CSS", "Bootstrap",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "DynamoDB", "Cassandra",
    "AWS", "EC2", "S3", "Lambda", "GCP", "Azure", "Docker", "Kubernetes", "K8s", "Git", "GitHub", "GitLab",
    "CI/CD", "Linux", "Unix", "Bash", "Terraform", "Ansible",
    "REST", "RESTful", "REST API", "GraphQL", "gRPC", "SOAP", "JWT", "OAuth", "OAuth2", "RBAC",
    "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Playwright", "Unit Testing", "Integration Testing", "TDD",
    "System Design", "Scalability", "High-Availability", "Microservices", "Serverless", "Monitoring", "Logging",
    "Agile", "Scrum", "SDLC", "Kanban", "DevOps",
    "NumPy", "Pandas", "Scikit-Learn", "TensorFlow", "PyTorch", "Keras", "XGBoost", "ARIMA", "Monte Carlo",
    "RAG", "LLM", "LLMs", "Generative AI", "NLP", "Computer Vision", "Machine Learning", "Deep Learning", "Data Science",
    "Vercel", "Render", "Heroku", "Netlify", "Cloudflare",
]

_STOP_WORDS_RE = re.compile(
    r"\b(within|curious|proactive|technologies|public|small|learning|eager|wider|experience|hands-on|working|knowledge)\b",
    re.IGNORECASE,
)

_SKILLS_HEADER_RE = re.compile(r"^(TECHNICAL SKILLS|SKILLS|TECHNOLOGIES|COMPETENCIES|CORE COMPETENCIES)", re.IGNORECASE)
_SKILLS_END_RE = re.compile(r"^[A-Z\s]{3,15}$")
_SKILLS_BLOCKLIST_RE = re.compile(
    r"^(Languages|Platforms|Infrastructure|Backend|APIs|Frontend|Data|Reliability|Systems|Practices|Tools|Frameworks)$",
    re.IGNORECASE,
)


def clean_bullet(text: Optional[str]) -> str:
    return _BULLET_PREFIX_RE.sub("", (text or "").strip()).strip()


def extract_keywords_from_text(text: Optional[str]) -> List[str]:
    if not text:
        return []
    skills: List[str] = []
    seen = set()

    def add(skill: str) -> None:
        key = skill.lower()
        if key not in seen:
            seen.add(key)
            skills.append(skill)

    for kw in _KNOWN_KEYWORDS:
        escaped = re.escape(kw)
        pattern = re.compile(rf"(?:^|[^a-zA-Z0-9#+.]){escaped}(?:$|[^a-zA-Z0-9#+.])", re.IGNORECASE)
        if pattern.search(text):
            add(kw)

    lines = text.split("\n")
    in_skills = False
    for line in lines:
        trimmed = line.strip()
        if _SKILLS_HEADER_RE.match(trimmed):
            in_skills = True
            continue
        if in_skills and _SKILLS_END_RE.match(trimmed) and not re.search(r"SKILLS|TECHNICAL", trimmed, re.IGNORECASE):
            in_skills = False
        if in_skills:
            content = trimmed.split(":", 1)[1] if ":" in trimmed else trimmed
            parts = re.split(r"[,\u00b7|/\u2022;\n]", content)
            for p in parts:
                p = clean_bullet(p)
                p = p.rstrip(".").strip()
                p = re.sub(r"\s*\([^)]*\)", "", p).strip()
                if (
                    p
                    and len(p) <= 35
                    and not _STOP_WORDS_RE.search(p)
                    and not _SKILLS_BLOCKLIST_RE.match(p)
                ):
                    add(p)

    return skills


def fallback_parse_resume(raw_text: Optional[str]) -> ParsedSections:
    if not raw_text or not raw_text.strip():
        return ParsedSections()

    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    email_match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", raw_text)
    email = email_match.group(0) if email_match else ""

    phone_match = re.search(r"(\+?\d{1,4}[\s.-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}", raw_text)
    phone = phone_match.group(0).strip() if phone_match else ""

    links: List[Link] = []
    github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_-]+", raw_text, re.IGNORECASE)
    if github_match:
        url = github_match.group(0)
        links.append(Link(label="GitHub", url=url if url.startswith("http") else f"https://{url}"))

    linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[A-Za-z0-9_-]+", raw_text, re.IGNORECASE)
    if linkedin_match:
        url = linkedin_match.group(0)
        links.append(Link(label="LinkedIn", url=url if url.startswith("http") else f"https://{url}"))

    name = ""
    for line in lines:
        if email and email in line:
            continue
        if phone and phone in line:
            continue
        if re.search(r"github|linkedin|http", line, re.IGNORECASE):
            continue
        if re.search(r"SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS", line, re.IGNORECASE):
            break
        if 2 <= len(line) <= 50:
            name = line
            break

    summary = ""
    summary_header_idx = next(
        (i for i, l in enumerate(lines) if re.match(r"^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|OBJECTIVE)", l, re.IGNORECASE)),
        -1,
    )
    if summary_header_idx >= 0:
        summary_lines = []
        for i in range(summary_header_idx + 1, len(lines)):
            if re.match(r"^(TECHNICAL SKILLS|SKILLS|EXPERIENCE|PROJECTS|EDUCATION|CERTIFICATIONS)", lines[i], re.IGNORECASE):
                break
            summary_lines.append(lines[i])
        summary = " ".join(summary_lines)

    skills = extract_keywords_from_text(raw_text)

    experience: List[ExperienceItem] = []
    exp_header_idx = next(
        (i for i, l in enumerate(lines) if re.match(r"^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT HISTORY)", l, re.IGNORECASE)),
        -1,
    )
    if exp_header_idx >= 0:
        current: Optional[dict] = None
        period_re = re.compile(
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*[\d-]*\s*(?:-|to)?\s*"
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|present|\d{4})?",
            re.IGNORECASE,
        )
        for i in range(exp_header_idx + 1, len(lines)):
            line = lines[i]
            if re.match(r"^(PROJECTS|EDUCATION|CERTIFICATIONS|TECHNICAL SKILLS|SKILLS)", line, re.IGNORECASE):
                break
            period_match = period_re.search(line)
            if period_match or " - " in line or " | " in line:
                if current and (current["company"] or current["role"] or current["bullets"]):
                    experience.append(ExperienceItem(**current))
                parts = [p.strip() for p in re.split(r"[|\u2022]", line)]
                role = parts[0] if parts else line
                company = parts[1] if len(parts) > 1 else ""
                period = period_match.group(0) if period_match else (parts[2] if len(parts) > 2 else "")
                current = {"role": role, "company": company, "location": "", "period": period, "bullets": []}
            elif current is not None:
                if line.startswith(("\u2022", "-", "*")):
                    current["bullets"].append(clean_bullet(line))
                elif current["bullets"]:
                    current["bullets"][-1] += " " + line
                else:
                    current["bullets"].append(line)
        if current and (current["company"] or current["role"] or current["bullets"]):
            experience.append(ExperienceItem(**current))

    projects: List[ProjectItem] = []
    proj_header_idx = next(
        (i for i, l in enumerate(lines) if re.match(r"^(PROJECTS|KEY PROJECTS|PERSONAL PROJECTS)", l, re.IGNORECASE)),
        -1,
    )
    if proj_header_idx >= 0:
        current_proj: Optional[dict] = None
        for i in range(proj_header_idx + 1, len(lines)):
            line = lines[i]
            if re.match(r"^(EDUCATION|CERTIFICATIONS|TECHNICAL SKILLS|SKILLS|EXPERIENCE)", line, re.IGNORECASE):
                break
            if not line.startswith(("\u2022", "-")) and len(line) < 120 and not line.startswith("Python") and not line.startswith("React"):
                if current_proj and (current_proj["name"] or current_proj["description"] or current_proj["bullets"]):
                    projects.append(ProjectItem(**current_proj))
                current_proj = {"name": line, "description": "", "period": "", "tech": [], "links": [], "bullets": []}
            elif current_proj is not None:
                if line.startswith(("\u2022", "-")):
                    clean_b = clean_bullet(line)
                    current_proj["bullets"].append(clean_b)
                elif "\u00b7" in line or " | " in line:
                    current_proj["tech"] = [t.strip() for t in re.split(r"[\u00b7|]+", line) if t.strip()]
                else:
                    if not current_proj["description"]:
                        current_proj["description"] = line
                    else:
                        current_proj["bullets"].append(line)
        if current_proj and (current_proj["name"] or current_proj["description"] or current_proj["bullets"]):
            projects.append(ProjectItem(**current_proj))

    education: List[EducationItem] = []
    edu_header_idx = next(
        (i for i, l in enumerate(lines) if re.match(r"^(EDUCATION|ACADEMIC BACKGROUND)", l, re.IGNORECASE)),
        -1,
    )
    if edu_header_idx >= 0:
        edu_text = []
        for i in range(edu_header_idx + 1, len(lines)):
            if re.match(r"^(CERTIFICATIONS|PROJECTS|SKILLS|EXPERIENCE)", lines[i], re.IGNORECASE):
                break
            edu_text.append(lines[i])
        if edu_text:
            education.append(
                EducationItem(
                    degree=edu_text[0] if len(edu_text) > 0 else "",
                    school=edu_text[1] if len(edu_text) > 1 else "",
                    location="",
                    period=next((l for l in edu_text if re.search(r"\d{4}", l)), ""),
                    details=next((l for l in edu_text if re.search(r"cgpa|gpa|marks|grade", l, re.IGNORECASE)), ""),
                )
            )

    certifications: List[CertificationItem] = []
    cert_header_idx = next(
        (i for i, l in enumerate(lines) if re.match(r"^(CERTIFICATIONS|CERTIFICATES)", l, re.IGNORECASE)),
        -1,
    )
    if cert_header_idx >= 0:
        for i in range(cert_header_idx + 1, len(lines)):
            line = lines[i]
            if re.match(r"^(EDUCATION|PROJECTS|SKILLS|EXPERIENCE)", line, re.IGNORECASE):
                break
            if len(line) > 3:
                certifications.append(CertificationItem(name=clean_bullet(line), issuer="", year=""))

    return ParsedSections(
        basics=Basics(name=name, title="", location="", email=email, phone=phone, links=links),
        summary=summary,
        experience=experience,
        education=education,
        skills=skills,
        projects=projects,
        certifications=certifications,
        languages=[],
        interests=[],
    )


def looks_empty(sections: Optional[ParsedSections]) -> bool:
    if not sections:
        return True
    b = sections.basics
    has_identity = bool(b.name or b.email or b.title)
    has_body = bool(sections.summary or sections.experience or sections.education or sections.skills)
    return not has_identity and not has_body


def merge_parsed_sections(primary: Optional[ParsedSections], secondary: Optional[ParsedSections]) -> ParsedSections:
    if not primary or looks_empty(primary):
        return secondary or ParsedSections()
    if not secondary or looks_empty(secondary):
        return primary

    merged = primary.model_copy(deep=True)

    merged.basics.name = merged.basics.name or secondary.basics.name
    merged.basics.title = merged.basics.title or secondary.basics.title
    merged.basics.location = merged.basics.location or secondary.basics.location
    merged.basics.email = merged.basics.email or secondary.basics.email
    merged.basics.phone = merged.basics.phone or secondary.basics.phone
    if not merged.basics.links and secondary.basics.links:
        merged.basics.links = secondary.basics.links

    if not merged.summary and secondary.summary:
        merged.summary = secondary.summary

    existing_skills = {s.lower() for s in merged.skills}
    combined_skills = list(merged.skills)
    for sk in secondary.skills:
        if sk.lower() not in existing_skills:
            existing_skills.add(sk.lower())
            combined_skills.append(sk)
    merged.skills = combined_skills

    if not merged.experience and secondary.experience:
        merged.experience = secondary.experience
    if not merged.education and secondary.education:
        merged.education = secondary.education
    if not merged.projects and secondary.projects:
        merged.projects = secondary.projects
    if not merged.certifications and secondary.certifications:
        merged.certifications = secondary.certifications
    if not merged.languages and secondary.languages:
        merged.languages = secondary.languages
    if not merged.interests and secondary.interests:
        merged.interests = secondary.interests

    return merged


def _to_parsed_sections(model: _ParsedResumeModel) -> ParsedSections:
    b = model.basics or _BasicsModel()
    links = [Link(label=l.label or "", url=l.url or "") for l in (b.links or []) if l]
    basics = Basics(
        name=b.name or "",
        title=b.title or "",
        location=b.location or "",
        email=b.email or "",
        phone=b.phone or "",
        links=links,
    )

    experience = [
        ExperienceItem(
            company=e.company or "",
            role=e.role or "",
            location=e.location or "",
            period=e.period or "",
            description=e.description or "",
            bullets=e.bullets or [],
        )
        for e in (model.experience or [])
        if e
    ]

    education = [
        EducationItem(
            degree=e.degree or "",
            school=e.school or "",
            location=e.location or "",
            period=e.period or "",
            details=e.details or "",
        )
        for e in (model.education or [])
        if e
    ]

    projects = [
        ProjectItem(
            name=p.name or "",
            description=p.description or "",
            period=p.period or "",
            tech=p.tech or [],
            links=[Link(label=l.label or "", url=l.url or "") for l in (p.links or []) if l],
            bullets=p.bullets or [],
        )
        for p in (model.projects or [])
        if p
    ]

    certifications = [
        CertificationItem(
            name=c.name or "",
            issuer=c.issuer or "",
            year=c.year or "",
        )
        for c in (model.certifications or [])
        if c
    ]

    return ParsedSections(
        basics=basics,
        summary=model.summary or "",
        experience=experience,
        education=education,
        skills=model.skills or [],
        projects=projects,
        certifications=certifications,
        languages=model.languages or [],
        interests=model.interests or [],
    )


def _get_model_candidates() -> List[str]:
    return settings.fallback_models


async def parse_resume(raw_text: Optional[str]) -> ParsedSections:
    fallback = fallback_parse_resume(raw_text)
    if not _client or not raw_text or not raw_text.strip():
        return fallback

    prompt = _build_prompt(raw_text)
    models_to_try = _get_model_candidates()

    for model_name in models_to_try:
        for attempt in range(1, 3):
            try:
                result = await _client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=genai_types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=_ParsedResumeModel,
                        temperature=0.1,
                    ),
                )
                text = result.text
                if not text:
                    raise ValueError("Empty response")
                parsed = _ParsedResumeModel.model_validate_json(text)
                return merge_parsed_sections(_to_parsed_sections(parsed), fallback)
            except Exception as err:  # noqa: BLE001
                err_str = str(err)
                logger.warning(
                    "Structured parse attempt %d failed for model %s: %s",
                    attempt,
                    model_name,
                    err,
                )
                is_transient = "503" in err_str or "UNAVAILABLE" in err_str or "429" in err_str
                if is_transient and attempt < 2:
                    await asyncio.sleep(1.0 * attempt + random.uniform(0.2, 0.5))
                    continue
                break

    logger.error("Structured parse failed across all models; falling back to rule-based parser")
    return fallback


def render_parsed_sections_to_text(sections: Optional[ParsedSections]) -> str:
    if not sections or looks_empty(sections):
        return ""

    lines: List[str] = []

    # Basics / Header
    b = sections.basics
    if b and b.name:
        lines.append(b.name.strip())

    if b:
        contact_items = []
        if b.title:
            contact_items.append(b.title.strip())
        if b.email:
            contact_items.append(b.email.strip())
        if b.phone:
            contact_items.append(b.phone.strip())
        if b.location:
            contact_items.append(b.location.strip())
        for link in (b.links or []):
            if link and link.url:
                label_prefix = f"{link.label}: " if link.label else ""
                contact_items.append(f"{label_prefix}{link.url}".strip())

        if contact_items:
            lines.append(" | ".join(contact_items))
    lines.append("")

    # Summary
    if sections.summary and sections.summary.strip():
        lines.append("SUMMARY")
        lines.append(sections.summary.strip())
        lines.append("")

    # Experience
    if sections.experience:
        lines.append("EXPERIENCE")
        for exp in sections.experience:
            header_parts = []
            if exp.role:
                header_parts.append(exp.role.strip())
            if exp.company:
                header_parts.append(exp.company.strip())
            if exp.location:
                header_parts.append(exp.location.strip())
            if exp.period:
                header_parts.append(exp.period.strip())
            if header_parts:
                lines.append(" - ".join(header_parts))
            if exp.description and exp.description.strip():
                lines.append(exp.description.strip())
            for bullet in (exp.bullets or []):
                cb = clean_bullet(bullet)
                if cb:
                    lines.append(f"\u2022 {cb}")
            lines.append("")

    # Projects
    if sections.projects:
        lines.append("PROJECTS")
        for proj in sections.projects:
            header_parts = []
            if proj.name:
                header_parts.append(proj.name.strip())
            if proj.period:
                header_parts.append(proj.period.strip())
            if header_parts:
                lines.append(" - ".join(header_parts))
            if proj.description and proj.description.strip():
                lines.append(proj.description.strip())
            if proj.tech:
                clean_tech = [t.strip() for t in proj.tech if t and t.strip()]
                if clean_tech:
                    lines.append(f"Technologies: {', '.join(clean_tech)}")
            for link in (proj.links or []):
                if link and link.url:
                    lines.append(f"Link: {link.url.strip()}")
            for bullet in (proj.bullets or []):
                cb = clean_bullet(bullet)
                if cb:
                    lines.append(f"\u2022 {cb}")
            lines.append("")

    # Technical Skills
    if sections.skills:
        clean_skills = [s.strip() for s in sections.skills if s and s.strip()]
        if clean_skills:
            lines.append("TECHNICAL SKILLS")
            lines.append(", ".join(clean_skills))
            lines.append("")

    # Education
    if sections.education:
        lines.append("EDUCATION")
        for edu in sections.education:
            header_parts = []
            if edu.degree:
                header_parts.append(edu.degree.strip())
            if edu.school:
                header_parts.append(edu.school.strip())
            if edu.location:
                header_parts.append(edu.location.strip())
            if edu.period:
                header_parts.append(edu.period.strip())
            if header_parts:
                lines.append(" - ".join(header_parts))
            if edu.details and edu.details.strip():
                lines.append(edu.details.strip())
            lines.append("")

    # Certifications
    if sections.certifications:
        lines.append("CERTIFICATIONS")
        for cert in sections.certifications:
            if cert and cert.name:
                cert_line = cert.name.strip()
                if cert.issuer:
                    cert_line += f" - {cert.issuer.strip()}"
                if cert.year:
                    cert_line += f" ({cert.year.strip()})"
                lines.append(f"\u2022 {cert_line}")
        lines.append("")

    # Languages
    if sections.languages:
        clean_lang = [l.strip() for l in sections.languages if l and l.strip()]
        if clean_lang:
            lines.append("LANGUAGES")
            lines.append(", ".join(clean_lang))
            lines.append("")

    # Interests
    if sections.interests:
        clean_int = [i.strip() for i in sections.interests if i and i.strip()]
        if clean_int:
            lines.append("INTERESTS")
            lines.append(", ".join(clean_int))
            lines.append("")

    return "\n".join(lines).strip()

