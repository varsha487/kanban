from flask import Flask
from flask_cors import CORS
from flask import request, jsonify
from services.auth import get_user
from services.supabase_client import supabase
from flask import request, jsonify
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

@app.route("/tasks", methods=["GET"])
def get_tasks():
    user = get_user()
    workspace_id = request.args.get("workspace_id")

    if not workspace_id:
        return jsonify({"error": "workspace_id required"}), 400

    tasks = supabase.table("tasks") \
        .select("""
            *,
            owner:profiles!tasks_user_id_fkey(
                id,
                username,
                avatar,
                color
            ),
            task_assignees(
                user_id,
                profiles(id, username, avatar, color)
            )
        """) \
        .eq("workspace_id", workspace_id) \
        .execute()
    
    task_list = tasks.data

    # attach comment counts
    for t in task_list:
        comments = supabase.table("task_comments") \
            .select("id") \
            .eq("task_id", t["id"]) \
            .execute()

        t["comment_count"] = len(comments.data)

    return jsonify(tasks.data)


@app.route("/task-comments", methods=["POST"])
def create_task_comment():
    user = get_user()
    data = request.json

    task_id = data["task_id"]
    content = data["content"]

    # get username from profiles table
    profile = supabase.table("profiles") \
        .select("username") \
        .eq("id", user.id) \
        .single() \
        .execute()

    username = profile.data["username"]

    comment = supabase.table("task_comments").insert({
        "task_id": task_id,
        "username": username,
        "content": content
    }).execute()

    return jsonify(comment.data)

@app.route("/task-comments", methods=["GET"])
def get_task_comments():
    user = get_user()
    task_id = request.args.get("task_id")

    if not task_id:
        return jsonify({"error": "task_id required"}), 400

    comments = supabase.table("task_comments") \
        .select("*") \
        .eq("task_id", task_id) \
        .order("created_at", desc=False) \
        .execute()

    return jsonify(comments.data)

@app.route("/workspaces", methods=["POST"])
def create_workspace():
    user = get_user()
    data = request.json
    print("Creating workspace with data: ", data)


    ws = supabase.table("workspaces").insert({
        "name": data["workspaceName"]
    }).execute()

    workspace_id = ws.data[0]["id"]

    supabase.table("workspace_members").insert({
        "user_id": user.id,
        "workspace_id": workspace_id,
    }).execute()

    for invited in data.get("invitedUsers", []):
        supabase.table("workspace_members").insert({
            "user_id": invited["id"],
            "workspace_id": workspace_id
        }).execute()

    return ws.data

@app.route("/workspaces", methods=["GET"])
def get_workspaces():
    user = get_user()

    data = supabase.table("workspace_members") \
        .select("workspace_id, workspaces(*)") \
        .eq("user_id", user.id) \
        .execute()

    workspaces = [item["workspaces"] for item in data.data]

    return jsonify(workspaces)

@app.route("/users/search", methods=["GET"])
def search_users():
    user = get_user()
    print("Getting user: ",user)

    query = request.args.get("q", "")

    if not query:
        return jsonify([])

    results = supabase.table("profiles") \
        .select("id, username, avatar, color") \
        .ilike("username", f"%{query}%") \
        .neq("id", user.id) \
        .limit(10) \
        .execute()
    print(results.data)

    return jsonify(results.data)

@app.route("/workspace-members", methods=["GET"])
def get_workspace_members():
    user = get_user()
    workspace_id = request.args.get("workspace_id")

    if not workspace_id:
        return jsonify({"error": "workspace_id required"}), 400
    members = supabase.table("workspace_members") \
        .select("user_id, profiles(username, avatar, color)") \
        .eq("workspace_id", workspace_id) \
        .execute()

    return jsonify([
    {
        "user_id": m["user_id"],
        "username": m["profiles"]["username"],
        "avatar": m["profiles"]["avatar"],
        "color": m["profiles"]["color"],
    }
    for m in members.data
])

@app.route("/tasks", methods=["PUT"])
def update_task():
    user = get_user()
    data = request.json

    updated = supabase.table("tasks") \
        .update({
            "title": data["title"],
            "description": data.get("description"),
            "status": data.get("status"),
            "priority": data.get("priority"),
            "due_date": data.get("due_date"),
        }) \
        .eq("id", data["id"]) \
        .execute()

    return updated.data

@app.route("/tasks/assign", methods=["POST"])
def assign_users_to_task():
    user = get_user()
    data = request.json

    task_id = data["task_id"]
    user_ids = data["user_ids"]  # array

    # remove existing assignments
    supabase.table("task_assignees") \
        .delete() \
        .eq("task_id", task_id) \
        .execute()

    # insert new ones
    inserts = [
        {"task_id": task_id, "user_id": uid}
        for uid in user_ids
    ]

    if inserts:
        supabase.table("task_assignees").insert(inserts).execute()

    return jsonify({"status": "ok"})

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


if __name__ == "__main__":
    app.run(debug=True)