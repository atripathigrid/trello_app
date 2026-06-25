# Trello REST API

A Trello-style project management application with a FastAPI backend, PostgreSQL database, Alembic migrations, and a Vite React frontend.

## Features

- User registration and JWT login
- Protected API routes with bearer token authentication
- Board creation and board listing for the current user
- Detailed board view with sections, tickets, members, and invites
- Board invite token generation and join flow
- Section create, update, and delete operations
- Ticket create, update, and delete operations
- React frontend for login, registration, dashboard, board view, and invite join pages

## Project Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- api/          # API routers and dependencies
|   |   |-- core/         # Config, database, security
|   |   |-- models/       # SQLAlchemy models
|   |   |-- schemas/      # Pydantic schemas
|   |   |-- services/     # Business logic
|   |   `-- main.py       # FastAPI application entrypoint
|   |-- alembic/          # Database migrations
|   |-- alembic.ini       # Alembic configuration
|   |-- Dockerfile        # Backend image
|   |-- requirements.txt  # Backend dependencies
|   `-- test_db.py        # Manual API smoke test script
|-- frontend/
|   |-- src/              # React source code
|   |-- public/           # Static frontend assets
|   |-- Dockerfile        # Frontend image
|   |-- package.json      # Frontend scripts and dependencies
|   `-- vite.config.js    # Vite configuration
|-- docker-compose.yml    # Local full-stack Docker setup
|-- description.md
`-- readme.md
```

## Tech Stack

Backend:

- Python
- FastAPI
- SQLAlchemy async ORM
- Alembic
- PostgreSQL
- JWT authentication with `python-jose`
- Password hashing with `passlib`

Frontend:

- React
- Vite
- React Router
- Zustand
- Axios
- Tailwind CSS
- `@hello-pangea/dnd`
- Lucide React icons

## Requirements

- Python 3.11+
- Node.js 20+
- Docker and Docker Compose
- Git

## Environment Variables

The backend reads variables from a `.env` file in the backend working directory. For local development, copy `backend/.env.example` to `backend/.env`:

```env
PROJECT_NAME="Trello REST API"
API_V1_STR="/api/v1"
SECRET_KEY="change-this-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password"
POSTGRES_SERVER="localhost"
POSTGRES_PORT="5433"
POSTGRES_DB="trello_api"
```

For the frontend, copy `frontend/.env.example` to `frontend/.env` if you need to override the backend API URL:

```env
VITE_API_URL="http://127.0.0.1:8000/api/v1"
```

Do not commit `.env` files or real secrets.

## Run With Docker Compose

From the project root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL at `localhost:5433`
- FastAPI backend at `http://127.0.0.1:8000`
- React frontend at `http://127.0.0.1:5173`

The backend service runs `alembic upgrade head` before starting Uvicorn.

To stop everything:

```bash
docker compose down
```

## Backend Setup

Open a terminal in the project root:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

On macOS/Linux:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start PostgreSQL from the project root:

```bash
docker compose up -d db
```

Run migrations from `backend/`:

```bash
alembic upgrade head
```

Start the FastAPI server from `backend/`:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- API root: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/api/v1/openapi.json`

## Frontend Setup

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:5173
```

## API Endpoints

All endpoints below are prefixed with `/api/v1`.

Auth:

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive a bearer token

Boards:

- `POST /boards` - Create a board
- `GET /boards` - List boards associated with the current user
- `GET /boards/{board_id}` - Get board details
- `POST /boards/{board_id}/invites` - Generate a board invite token
- `POST /boards/{board_id}/join?token={token}` - Join a board with an invite token

Sections:

- `POST /boards/{board_id}/sections` - Create a section
- `PUT /sections/{section_id}` - Update a section
- `DELETE /sections/{section_id}` - Delete a section

Tickets:

- `POST /sections/{section_id}/tickets` - Create a ticket
- `PUT /tickets/{ticket_id}` - Update a ticket
- `DELETE /tickets/{ticket_id}` - Delete a ticket

Protected routes require this header:

```text
Authorization: Bearer <access_token>
```

## Manual Smoke Test

After starting PostgreSQL, running migrations, and starting the backend server, run this from `backend/`:

```bash
python test_db.py
```

The script registers two users, logs them in, creates a board, generates an invite, joins the second user to the board, and checks board access.

## Useful Commands

```bash
# Start the full stack
docker compose up --build

# Start only the database
docker compose up -d db

# Stop Docker services
docker compose down

# Run backend migrations
cd backend
alembic upgrade head

# Create a new backend migration
cd backend
alembic revision --autogenerate -m "describe change"

# Start backend locally
cd backend
uvicorn app.main:app --reload

# Start frontend locally
cd frontend
npm run dev

# Lint frontend
cd frontend
npm run lint

# Build frontend
cd frontend
npm run build
```

## Notes

- `docker-compose.yml` is kept at the project root so it can orchestrate both `backend/` and `frontend/`.
- Backend code runs with `backend/` as the working directory, so imports like `app.main` remain valid.
- Frontend requests use `VITE_API_URL`, falling back to `http://127.0.0.1:8000/api/v1`.
- Backend CORS is currently open for local development.
- Keep generated files, local virtual environments, frontend build output, database dumps, and secrets out of Git.
