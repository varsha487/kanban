# 🗂️ Kanban Task Management App

## Overview

This project is a full-stack collaborative Kanban-based task management application that allows users to create workspaces, manage tasks, assign teammates, and track progress across customizable columns (To Do, In Progress, In Review, Done). The application supports real-time updates, task comments, and activity tracking, enabling multiple users within a workspace to collaborate efficiently.

The frontend is built with **Next.js and React**, providing an interactive drag-and-drop interface, while the backend is implemented using **Flask** with a **Supabase (PostgreSQL)** database for persistence and authentication.

---

## 🧠 Design Decisions

### Separation of Concerns (Frontend vs Backend)

* **Frontend (Next.js)** → handles UI, drag-and-drop interactions, and state
* **Backend (Flask API)** → handles data persistence, business logic, and API endpoints
* **Supabase** → used as the database and authentication provider

This separation allows independent scaling and easier debugging.

---

### Comment System as Separate Table

Comments are stored in a dedicated table (`task_comments`) rather than embedded in tasks:

* supports unlimited comments
* enables chronological ordering
* allows future extensions (e.g., reactions, edits)

---

### Global Usernames

Users are identified with a global user rather than a workspace specific user name due to time constraints and simpler database schema.

---

### Frontend Design Choices

* earth tones were chosen for color scheme
* layout of Kanban board with 4 columns in the center
* modification options at the bottom
* workspace selection at the top left for a simple UI

---

## 🔗 Links

* **Live App:** [https://kanban-eosin-six.vercel.app/](https://kanban-eosin-six.vercel.app/)
* **GitHub Repository:** [https://github.com/varsha487/kanban.git](https://github.com/varsha487/kanban.git)

---

## 🗄️ Full Database Schema

### profiles

* id → references auth schema id
* username
* avatar
* color
* created_at

### task_assignees

* id
* task_id → references tasks.id
* user_id → references profile.id
* created_at

### task_comments

* id
* task_id → references tasks.id
* username → references profile.username
* content
* created_at

### tasks

* id
* workspace_id
* title
* description
* status
* priority
* due_date
* created_at
* updated_at
* user_id

### workspaces

* id
* name
* created_at

### workspace_members

* id
* workspace_id → references workspaces.id
* user_id → references profiles.id
* created_at

---

## ⚙️ Setup to Run Locally

### 1. Clone Repository

```bash
git clone https://github.com/your-username/kanban.git
cd kanban
```

---

### 2. Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # (Linux)
pip install -r requirements.txt
```

Create a `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

Run backend:

```bash
flask run
```

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

Run frontend:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🚀 Advanced Features

### Team Members and Assignees

I created a workspace feature that allows users to create workspaces and invite other users that are also part of the app. As a result, I implemented a global username feature so users can search up other users to join their workspace. This username is a unique identifier that people can set for themselves.

I also added:

* avatar selection
* background color customization

Users can assign other people within a workspace to a task. Only the user that makes the task (the owner) is able to move the task to other columns.

---

### Task Comments

I implemented a comments modal that users can open when clicking the comments icon, and the number refers to the number of comments that have been made. Users can:

* see the username that made comments
* make their own comment

---

## ⚖️ Tradeoffs

### Use of Modals vs Simplicity of Base Home Page

I used several modals instead of separate panels. This allowed faster feature addition without redesigning layout, but is less scalable.

---

### Persistence in Backend vs Frontend Reactivity

Almost every update immediately sends to the backend instead of caching and updating later.

* ✅ ensures accuracy
* ❌ slightly slower UI

---

### Real-Time Updates vs System Complexity

Used Supabase real-time listeners + frequent refetching:

* ✅ simpler implementation
* ❌ not optimized

A better approach would use:

* WebSockets
* event-based patch updates

---

### Inline Business Logic vs Reusable Abstractions

Some logic is embedded directly in components:

* faster development
* less reusable
* harder to refactor

---

### Flask Backend vs Larger Framework Ecosystems

Flask was chosen for:

* simplicity
* familiarity
* rapid prototyping

However, it lacks:

* built-in structure
* strong typing
* automatic documentation

Compared to frameworks like FastAPI or NestJS.

---

## 🔧 Improvements with More Time

* Add history of task movement in comment section
* Add a comment panel
* Fix refreshing functionality for better real-time updates
* Add filtering feature
* Improve drag performance (reduce lag)

