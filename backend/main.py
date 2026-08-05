import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from dotenv import load_dotenv

from database import get_connection, init_pool, close_pool
from models import TaskCreate, TaskUpdate, TaskOut

load_dotenv()

app = FastAPI(title="TaskNova API", description="A simple To-Do list API backed by Oracle DB")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_pool()


@app.on_event("shutdown")
def shutdown():
    close_pool()


def row_to_task(row):
    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "status": row[3],
        "created_at": row[4],
        "updated_at": row[5],
    }


@app.get("/")
def root():
    return {"message": "TaskNova API is running"}


# ---------- CREATE ----------
@app.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(task: TaskCreate):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO tasks (title, description, status)
            VALUES (:title, :description, :status)
            """,
            {
                "title": task.title,
                "description": task.description,
                "status": task.status or "PENDING",
            },
        )
        conn.commit()
        new_id = cur.lastrowid

        cur.execute(
            "SELECT id, title, description, status, created_at, updated_at "
            "FROM tasks WHERE id = :id",
            {"id": new_id},
        )
        row = cur.fetchone()
        return row_to_task(row)
    finally:
        conn.close()


# ---------- READ (list all / display) ----------
@app.get("/tasks", response_model=List[TaskOut])
def list_tasks():
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, title, description, status, created_at, updated_at "
            "FROM tasks ORDER BY id DESC"
        )
        rows = cur.fetchall()
        return [row_to_task(r) for r in rows]
    finally:
        conn.close()


# ---------- READ (single task) ----------
@app.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, title, description, status, created_at, updated_at "
            "FROM tasks WHERE id = :id",
            {"id": task_id},
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Task not found")
        return row_to_task(row)
    finally:
        conn.close()


# ---------- UPDATE ----------
@app.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task: TaskUpdate):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM tasks WHERE id = :id", {"id": task_id})
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")

        fields = []
        params = {"id": task_id}
        if task.title is not None:
            fields.append("title = :title")
            params["title"] = task.title
        if task.description is not None:
            fields.append("description = :description")
            params["description"] = task.description
        if task.status is not None:
            fields.append("status = :status")
            params["status"] = task.status

        if fields:
            cur.execute(
                f"UPDATE tasks SET {', '.join(fields)} WHERE id = :id", params
            )
            conn.commit()

        cur.execute(
            "SELECT id, title, description, status, created_at, updated_at "
            "FROM tasks WHERE id = :id",
            {"id": task_id},
        )
        row = cur.fetchone()
        return row_to_task(row)
    finally:
        conn.close()


# ---------- DELETE ----------
@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM tasks WHERE id = :id", {"id": task_id})
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")
        cur.execute("DELETE FROM tasks WHERE id = :id", {"id": task_id})
        conn.commit()
        return
    finally:
        conn.close()
