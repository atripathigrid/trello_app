from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.models.board import Board, BoardMember
from app.models.section import Section
from app.schemas.board import BoardCreate, BoardUpdate

async def assert_board_access(db: AsyncSession, board_id: int, user_id: int) -> Board:
    """
    Core permission check.
    Returns the board if the user is the owner or a member.
    Raises 403 Forbidden or 404 Not Found otherwise.
    """
    result = await db.execute(select(Board).options(selectinload(Board.members)).where(Board.id == board_id))
    board = result.scalars().first()
    
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
        
    if board.owner_id == user_id:
        return board
        
    is_member = any(member.user_id == user_id for member in board.members)
    if is_member:
        return board
        
    raise HTTPException(status_code=403, detail="Not enough permissions to access this board")

async def create_board(db: AsyncSession, board_in: BoardCreate, owner_id: int) -> Board:
    """Creates a new board and sets the current user as the owner."""
    db_board = Board(**board_in.model_dump(), owner_id=owner_id)
    db.add(db_board)
    await db.commit()
    await db.refresh(db_board)
    return db_board

async def get_user_boards(db: AsyncSession, user_id: int) -> list[Board]:
    """Retrieves all boards owned by the user or where the user is a member."""
    # Boards owned by user
    owned_result = await db.execute(select(Board).where(Board.owner_id == user_id))
    owned_boards = owned_result.scalars().all()
    
    # Boards where user is member
    member_result = await db.execute(
        select(Board).join(BoardMember).where(BoardMember.user_id == user_id)
    )
    member_boards = member_result.scalars().all()
    
    # Combine and remove duplicates
    all_boards = {b.id: b for b in owned_boards + member_boards}
    return list(all_boards.values())

async def get_board_detail(db: AsyncSession, board_id: int, user_id: int) -> dict:
    """
    Retrieves detailed board info if accessible.
    Includes sections, tickets, members, and invites.
    """
    # First check access
    await assert_board_access(db, board_id, user_id)
    
    # Then query with relationships loaded
    result = await db.execute(
        select(Board)
        .options(
            selectinload(Board.sections).selectinload(Section.tickets),
            selectinload(Board.members).selectinload(BoardMember.user), # Load members and their user data
            selectinload(Board.invites)
        )
        .where(Board.id == board_id)
    )
    board = result.scalars().first()
    return {
        "id": board.id,
        "name": board.name,
        "description": board.description,
        "owner_id": board.owner_id,
        "sections": board.sections,
        "members": [member.user for member in board.members],
        "invites": board.invites,
    }
