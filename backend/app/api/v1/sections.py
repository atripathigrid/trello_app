from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.section import SectionCreate, SectionUpdate, SectionResponse
from app.services.section_service import create_section, update_section, delete_section

router = APIRouter()

@router.post("/boards/{board_id}/sections", response_model=SectionResponse)
async def create_new_section(
    board_id: int,
    section_in: SectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new section in a board."""
    return await create_section(db=db, board_id=board_id, section_in=section_in, user_id=current_user.id)

@router.put("/sections/{section_id}", response_model=SectionResponse)
async def update_existing_section(
    section_id: int,
    section_in: SectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a section."""
    return await update_section(db=db, section_id=section_id, section_in=section_in, user_id=current_user.id)

@router.delete("/sections/{section_id}", status_code=204)
async def delete_existing_section(
    section_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a section."""
    await delete_section(db=db, section_id=section_id, user_id=current_user.id)
    return None
