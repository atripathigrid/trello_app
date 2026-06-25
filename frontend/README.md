# Trello Frontend

React + Vite frontend for the Trello REST API project.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://127.0.0.1:5173` by default.

## Docker

The frontend has its own Dockerfile and is built by the root `docker-compose.yml`.

## Environment

Copy `.env.example` to `.env` if you need to override the backend API URL:

```env
VITE_API_URL="http://127.0.0.1:8000/api/v1"
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```
