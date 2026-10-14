# AI Resume Roaster – FastAPI Backend

Python/FastAPI port of the original Node/Express + MongoDB backend. Same
routes, same response shapes (`camelCase` JSON), same behavior — different
runtime.

## Stack mapping

| Node/Express            | FastAPI/Python                     |
|--------------------------|-------------------------------------|
| Express                  | FastAPI                             |
| Mongoose                 | Beanie (Motor/MongoDB ODM)          |
| jsonwebtoken              | PyJWT                              |
| bcrypt                   | bcrypt                              |
| zod                      | Pydantic v2                         |
| multer                   | FastAPI `UploadFile`                |
| pdf-parse                | pypdf                               |
| diff                     | difflib (custom word/line diff)     |
| @google/genai             | google-genai (Python SDK)           |
| express-rate-limit        | in-memory sliding-window limiter    |

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# then edit .env: MONGO_URI, JWT_SECRET, GEMINI_API_KEY, etc.
```

## Run (development, auto-reload)

```bash
uvicorn app.main:app --reload --port 5000
```

## Run (production)

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4
```

The API is served at `http://localhost:5000`, with interactive docs at
`http://localhost:5000/docs` (Swagger UI) and `/redoc`.

## Environment variables (`.env`)

```
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://localhost:27017/resume-roaster

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN_DAYS=7

COOKIE_NAME=your-token

CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000

GEMINI_API_KEY=your-gemini-ai-key
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODELS=gemini-3.5-flash-lite,gemini-3.7-flash,gemini-3.1-flash-lite
```

`MONGO_URI` should include the database name, e.g.
`mongodb://localhost:27017/resume-roaster` or an Atlas SRV URI with
`/resume-roaster` as the path.

## Routes (unchanged from the Node backend)

- `GET  /api/health`
- `POST /api/auth/register`, `/login`, `/logout`, `GET /me`, `PATCH /profile`, `PATCH /password`
- `POST /api/resumes` (multipart PDF upload), `GET /`, `GET /{id}`, `GET /{id}/versions/{versionId}`, `DELETE /{id}`
- `POST /api/resumes/{id}/analyze`, `GET /{id}/analyses`, `GET /{id}/versions/{versionId}/analysis`
- `POST /api/resumes/{id}/rewrite`
- `GET  /api/resumes/{id}/diff?from=&to=&mode=words|lines`
- `GET  /api/dashboard`
- `GET  /api/insights`
- `GET  /api/history`
- `GET  /api/versions`

Auth uses the same httpOnly session cookie approach (`COOKIE_NAME`), so an
existing frontend that calls these endpoints with `credentials: "include"`
needs no changes beyond pointing at the new backend's URL/port.

## Notes / behavior differences

- Rate limiting is in-memory per-process (same limitation as the original
  `express-rate-limit` setup without a shared store) — fine for a single
  instance, not for multi-worker/horizontally-scaled deployments. Swap in
  Redis-backed limiting if you scale out.
- PDF text extraction uses `pypdf` instead of `pdf-parse`; extraction
  quality is very close but not byte-identical on complex layouts.
- Validation errors return `{"error": {"message": "Validation failed", "details": [...]}}`
  matching the shape (details format differs slightly from Zod's).
