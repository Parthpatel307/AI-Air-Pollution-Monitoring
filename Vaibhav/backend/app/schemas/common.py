"""Common schemas."""

from pydantic import BaseModel


class APIError(BaseModel):
    code: str
    message: str


class APIErrorResponse(BaseModel):
    success: bool = False
    error: APIError