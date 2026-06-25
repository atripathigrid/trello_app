from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.board import BoardCreate, BoardResponse, BoardDetailResponse
from app.schemas.invite import InviteCreateResponse, InviteJoinResponse
from app.services.board_service import create_board, get_user_boards, get_board_detail
from app.services.invite_service import generate_invite, join_board

router = APIRouter()

@router.post("", response_model=BoardResponse)
async def create_new_board(
    board_in: BoardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new board."""
    return await create_board(db=db, board_in=board_in, owner_id=current_user.id)

@router.get("", response_model=list[BoardResponse])
async def read_user_boards(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all boards associated with the current user."""
    return await get_user_boards(db=db, user_id=current_user.id)

@router.get("/{board_id}", response_model=BoardDetailResponse)
async def read_board_detail(
    board_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information for a specific board."""
    return await get_board_detail(db=db, board_id=board_id, user_id=current_user.id)

@router.post("/{board_id}/invites", response_model=InviteCreateResponse)
async def create_board_invite(
    board_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate an invite token/link for a board."""
    return await generate_invite(db=db, board_id=board_id, user_id=current_user.id)

@router.post("/{board_id}/join", response_model=InviteJoinResponse)
async def join_board_via_token(
    board_id: int,
    token: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a board using an invite token."""
    member = await join_board(db=db, board_id=board_id, token_uuid=token, user_id=current_user.id)
    return {"message": "Successfully joined the board", "board_id": member.board_id}
