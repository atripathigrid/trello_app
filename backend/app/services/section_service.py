from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.section import Section
from app.schemas.section import SectionCreate, SectionUpdate
from app.services.board_service import assert_board_access

async def create_section(db: AsyncSession, board_id: int, section_in: SectionCreate, user_id: int) -> Section:
    """Creates a new section in a board. Requires board access."""
    await assert_board_access(db, board_id, user_id)
    
    db_section = Section(**section_in.model_dump(), board_id=board_id)
    db.add(db_section)
    await db.commit()
    await db.refresh(db_section)
    return db_section

async def get_section(db: AsyncSession, section_id: int) -> Section:
    """Helper to get a section by ID."""
    result = await db.execute(select(Section).where(Section.id == section_id))
    section = result.scalars().first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section

async def update_section(db: AsyncSession, section_id: int, section_in: SectionUpdate, user_id: int) -> Section:
    """Updates a section's details. Requires access to the parent board."""
    section = await get_section(db, section_id)
    await assert_board_access(db, section.board_id, user_id)
    
    update_data = section_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(section, field, value)
        
    await db.commit()
    await db.refresh(section)
    return section

async def delete_section(db: AsyncSession, section_id: int, user_id: int):
    """Deletes a section. Requires access to the parent board."""
    section = await get_section(db, section_id)
    await assert_board_access(db, section.board_id, user_id)
    
    await db.delete(section)
    await db.commit()
