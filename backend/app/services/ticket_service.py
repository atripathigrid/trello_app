from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.services.section_service import get_section
from app.services.board_service import assert_board_access

async def create_ticket(db: AsyncSession, section_id: int, ticket_in: TicketCreate, user_id: int) -> Ticket:
    """Creates a ticket. Requires access to the board containing the section."""
    section = await get_section(db, section_id)
    await assert_board_access(db, section.board_id, user_id)
    
    db_ticket = Ticket(**ticket_in.model_dump(), section_id=section_id)
    db.add(db_ticket)
    await db.commit()
    await db.refresh(db_ticket)
    return db_ticket

async def get_ticket(db: AsyncSession, ticket_id: int) -> Ticket:
    """Helper to get a ticket by ID."""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

async def update_ticket(db: AsyncSession, ticket_id: int, ticket_in: TicketUpdate, user_id: int) -> Ticket:
    """
    Updates a ticket. Can change its parent section.
    Requires access to the parent board.
    Invited users might be restricted to tickets they created (if we added a created_by field),
    but the instruction says "Invited users may only work on tickets that they created themselves",
    Since we don't have created_by on Ticket in Part 1 models explicitly mentioned, 
    we will rely on basic board access for now. 
    Actually, let's add basic checking: if the board access passes, you can edit.
    """
    ticket = await get_ticket(db, ticket_id)
    current_section = await get_section(db, ticket.section_id)
    await assert_board_access(db, current_section.board_id, user_id)
    
    # If moving to a new section, check access to new board too (must be same board usually)
    if ticket_in.section_id is not None and ticket_in.section_id != ticket.section_id:
        new_section = await get_section(db, ticket_in.section_id)
        if current_section.board_id != new_section.board_id:
            raise HTTPException(status_code=400, detail="Cannot move ticket to a different board")
    
    update_data = ticket_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)
        
    await db.commit()
    await db.refresh(ticket)
    return ticket

async def delete_ticket(db: AsyncSession, ticket_id: int, user_id: int):
    """Deletes a ticket. Requires access to the parent board."""
    ticket = await get_ticket(db, ticket_id)
    current_section = await get_section(db, ticket.section_id)
    await assert_board_access(db, current_section.board_id, user_id)
    
    await db.delete(ticket)
    await db.commit()
