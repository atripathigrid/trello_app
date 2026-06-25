from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse
from app.services.ticket_service import create_ticket, update_ticket, delete_ticket

router = APIRouter()

@router.post("/sections/{section_id}/tickets", response_model=TicketResponse)
async def create_new_ticket(
    section_id: int,
    ticket_in: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new ticket in a section."""
    return await create_ticket(db=db, section_id=section_id, ticket_in=ticket_in, user_id=current_user.id)

@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_existing_ticket(
    ticket_id: int,
    ticket_in: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a ticket."""
    return await update_ticket(db=db, ticket_id=ticket_id, ticket_in=ticket_in, user_id=current_user.id)

@router.delete("/tickets/{ticket_id}", status_code=204)
async def delete_existing_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a ticket."""
    await delete_ticket(db=db, ticket_id=ticket_id, user_id=current_user.id)
    return None
