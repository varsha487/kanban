from flask import Flask
from flask_cors import CORS
from flask import request, jsonify
from services.auth import get_user
from services.supabase_client import supabase
from flask import request, jsonify
from services.auth import get_user
from services.supabase_client import supabase

app = Flask(__name__)
CORS(app)

@app.route("/tasks", methods=["POST"])
def create_task():
    user = get_user()

    data = request.json

    task = supabase.table("tasks").insert({
        "title": data["title"],
        "description": data.get("description"),
        "status": data.get("status", "todo"),
        "priority": data.get("priority", "normal"),
        "user_id": user.id,
        "workspace_id": data.get("workspace_id"),
        "due_date": data.get("due_date"),
    }).execute()

    return task.data
@app.route("/tasks", methods=["PUT"])
def update_task():
    user = get_user()
    data = request.json

    updated = supabase.table("tasks").update({
        "title": data["title"],
        "description": data.get("description"),
        "priority": data.get("priority"),
        "due_date": data.get("due_date"),
    }).eq("id", data["id"]).eq("user_id", user.id).execute()

    return updated.data

@app.route("/init-user", methods=["POST"])
def init_user():
    user = get_user()

    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    # check if user already has workspace
    existing = supabase.table("workspace_members") \
        .select("*") \
        .eq("user_id", user.id) \
        .execute()

    if existing.data:
        return jsonify({"status": "exists"})

    # create workspace
    ws = supabase.table("workspaces").insert({
        "name": "My Workspace"
    }).execute()

    workspace_id = ws.data[0]["id"]

    # link user
    supabase.table("workspace_members").insert({
        "user_id": user.id,
        "workspace_id": workspace_id
    }).execute()

    return jsonify({"workspace_id": workspace_id})

@app.route("/tasks", methods=["GET"])
def get_tasks():
    user = get_user()

    tasks = supabase.table("tasks") \
        .select("*") \
        .eq("user_id", user.id) \
        .execute()

    return jsonify(tasks.data)

if __name__ == "__main__":
    app.run(debug=True)