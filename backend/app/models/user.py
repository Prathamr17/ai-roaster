from datetime import datetime, timezone

import pymongo
from beanie import Document
from pydantic import EmailStr, Field


class User(Document):
    email: EmailStr
    password_hash: str = Field(alias="passwordHash")
    name: str = Field(max_length=80)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="createdAt")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="updatedAt")

    class Settings:
        name = "users"
        indexes = [
            pymongo.IndexModel([("email", pymongo.ASCENDING)], unique=True),
        ]

    class Config:
        populate_by_name = True

    def to_public(self) -> dict:
        """Equivalent of the Mongoose toJSON() that strips passwordHash/__v."""
        return {
            "_id": str(self.id),
            "email": self.email,
            "name": self.name,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
