# TaskNova — To-Do List App
FastAPI + Oracle DB + React (Vite)

A complete, ready-to-run To-Do list app with full CRUD:
- ✅ Add task
- ✅ Display all tasks (from Oracle DB)
- ✅ Edit / Update task inline (title, description, status)
- ✅ Delete task
- ✅ Mark done with a checkbox, filter by status
- Every action hits the database immediately and the UI reflects it.

---

## 1. Prerequisites

- Python 3.10+
- Node.js 18+
- An Oracle Database (local Oracle XE, or Oracle Cloud Autonomous DB — either works)

---

## 2. Set up the Oracle database

1. Connect to your Oracle DB (SQL*Plus, SQL Developer, or any client) as the schema/user you'll use for the app.
2. Run the script in `backend/schema.sql` — it creates the `tasks` table and an auto-update trigger.

```sql
@backend/schema.sql
```

---

## 3. Backend setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# now edit .env and fill in ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN

uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.
Interactive docs (auto-generated): `http://localhost:8000/docs`

**Note on connecting:** this uses the `oracledb` driver in "thin" mode, so you do **not** need to install Oracle Instant Client for a normal DB connection. If you're using Oracle Autonomous DB with a wallet, set `ORACLE_WALLET_DIR` in `.env` and uncomment the `init_oracle_client` line in `database.py`.

---

## 4. Frontend setup (React + Vite)

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_URL should point to your backend, default http://localhost:8000

npm run dev
```

Open `http://localhost:5173` in your browser. 🎉

---

## 5. Project structure

```
tasknova/
├── backend/
│   ├── main.py          # FastAPI app + all CRUD routes
│   ├── database.py      # Oracle connection pool (oracledb)
│   ├── models.py        # Pydantic request/response schemas
│   ├── schema.sql        # Run once to create the tasks table
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js                 # talks to the FastAPI backend
    │   ├── index.css
    │   └── components/
    │       ├── TaskForm.jsx       # Add task
    │       └── TaskItem.jsx       # Display / inline edit / delete
    ├── package.json
    └── .env.example
```

---

## 6. API reference

| Method | Endpoint         | Description         |
|--------|------------------|----------------------|
| GET    | `/tasks`         | List all tasks       |
| GET    | `/tasks/{id}`    | Get one task         |
| POST   | `/tasks`         | Create a task         |
| PUT    | `/tasks/{id}`    | Update a task         |
| DELETE | `/tasks/{id}`    | Delete a task         |

---

## 7. Troubleshooting

- **`DPY-6005` / connection errors** → double-check `ORACLE_DSN`, `ORACLE_USER`, `ORACLE_PASSWORD` in `backend/.env`.
- **CORS errors in browser console** → make sure `FRONTEND_ORIGIN` in `backend/.env` matches the URL your React app runs on (default `http://localhost:5173`).
- **Frontend can't reach API** → check `VITE_API_URL` in `frontend/.env` matches where uvicorn is running.
