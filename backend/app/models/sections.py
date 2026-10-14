from typing import List, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, Field


class Link(BaseModel):
    label: str = ""
    url: str = ""


class Basics(BaseModel):
    name: str = ""
    title: str = ""
    location: str = ""
    email: str = ""
    phone: str = ""
    links: List[Link] = Field(default_factory=list)


class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    location: str = ""
    period: str = ""
    description: str = ""
    bullets: List[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    degree: str = ""
    school: str = ""
    location: str = ""
    period: str = ""
    details: str = ""


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    period: str = ""
    tech: List[str] = Field(default_factory=list)
    links: List[Link] = Field(default_factory=list)
    bullets: List[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    name: str = ""
    issuer: str = ""
    year: str = ""


class ParsedSections(BaseModel):
    basics: Basics = Field(default_factory=Basics)
    summary: str = ""
    experience: List[ExperienceItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)


class ScoreBreakdown(BaseModel):
    keywords: float = 0
    formatting: float = 0
    impact: float = 0
    clarity: float = 0


class Issue(BaseModel):
    title: str
    severity: str = "medium"  # low | medium | high
    explanation: str = ""
    fix: str = ""


class Strength(BaseModel):
    title: str
    evidence: str = ""


class BulletRewrite(BaseModel):
    id: str = Field(default_factory=lambda: str(PydanticObjectId()), alias="_id")
    section: str = ""
    original: str
    rewritten: str
    rationale: str = ""

    class Config:
        populate_by_name = True
