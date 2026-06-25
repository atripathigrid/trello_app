from fastapi import APIRouter
from app.api.v1 import auth, boards, sections, tickets

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(boards.router, prefix="/boards", tags=["boards"])
api_router.include_router(sections.router, tags=["sections"])
api_router.include_router(tickets.router, tags=["tickets"])
