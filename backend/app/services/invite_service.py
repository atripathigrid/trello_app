from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.invite import InviteToken
from app.models.board import Board, BoardMember
from app.services.board_service import assert_board_access
from datetime import datetime

async def generate_invite(db: AsyncSession, board_id: int, user_id: int) -> InviteToken:
    """
    Generates a new invite token for a board.
    Only the board owner (or a member, based on rules) can do this.
    For now, let's assume members can also invite, as per assert_board_access.
    """
    # Ensure user has access
    await assert_board_access(db, board_id, user_id)
    
    # Check if board exists
    result = await db.execute(select(Board).where(Board.id == board_id))
    board = result.scalars().first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
        
    db_invite = InviteToken(board_id=board_id)
    db.add(db_invite)
    await db.commit()
    await db.refresh(db_invite)
    return db_invite

async def join_board(db: AsyncSession, board_id: int, token_uuid: str, user_id: int) -> BoardMember:
    """
    Uses an invite token to add a user to a board as a member.
    """
    # Verify token
    result = await db.execute(
        select(InviteToken).where(
            InviteToken.token_uuid == token_uuid,
            InviteToken.board_id == board_id
        )
    )
    invite = result.scalars().first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invite token or board")
        
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invite token has expired")
        
    # Check if user is already the owner
    board_result = await db.execute(select(Board).where(Board.id == board_id))
    board = board_result.scalars().first()
    if board.owner_id == user_id:
        raise HTTPException(status_code=400, detail="You are already the owner of this board")
        
    # Check if already a member
    member_result = await db.execute(
        select(BoardMember).where(
            BoardMember.board_id == board_id,
            BoardMember.user_id == user_id
        )
    )
    existing_member = member_result.scalars().first()
    if existing_member:
        raise HTTPException(status_code=400, detail="You are already a member of this board")
        
    # Add to board members
    db_member = BoardMember(board_id=board_id, user_id=user_id)
    db.add(db_member)
    await db.commit()
    await db.refresh(db_member)
    return db_member
