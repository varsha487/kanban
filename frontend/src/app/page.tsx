"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { callAPI } from "@/lib/api"
import KanbanBoard from "@/components/KanbanBoard"
import DatePicker from "react-datepicker"
import WorkspaceModal from "@/components/workspace/WorkspaceModal"
import WorkspacePanel from "@/components/workspace/WorkspacePanel"
import ProfileSetupModal from "@/components/profile/ProfileSetupModal"
import TaskModal from "@/components/tasks/TaskModal"
import TaskCommentsModal from "@/components/tasks/TaskCommentsModal"

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("normal")
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null)
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [commentMode, setCommentMode] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const isEditing = !!editingTask
  const handleEdit = (task: any) => {
  setEditingTask(task)
  setTitle(task.title)
  setDescription(task.description)
  setPriority(task.priority || "normal")
  setDueDate(task.due_date ? new Date(task.due_date) : null)
  setShowModal(true)
  setAssignedUsers(task.assignees || [])
}

const fetchTasks = async () => {
  if (!activeWorkspace || !session) return

  const fetchedTasks = await callAPI(
    `/tasks?workspace_id=${activeWorkspace.id}`,
    "GET",
    session.access_token
  )

  setTasks(fetchedTasks)
}

  useEffect(() => {
  const init = async () => {
    
    const { data } = await supabase.auth.getSession()

    let currentSession = data.session

    if (!currentSession) {
      const res = await supabase.auth.signInAnonymously()
      currentSession = res.data.session
    }

    setSession(currentSession)
    if (currentSession) {
    const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentSession.user.id)
        .single()

      if (!profileData) {
        setShowProfileModal(true)
        return 
      }

      setProfile(profileData)
    }

    // only continue if we have a session (either existing or newly created)
    if (currentSession) {
      // initialize user in DB (if not already) and fetch workspaces + tasks
      await callAPI("/init-user", "POST", currentSession.access_token)
      
      // fetch workspaces + tasks
      const ws = await callAPI(
        "/workspaces",
        "GET",
        currentSession.access_token
      )
      setWorkspaces(ws)
      setActiveWorkspace(ws[0])
    }
  }
  init()
}, [])

useEffect(() => {
  fetchTasks()
}, [activeWorkspace, session])

useEffect(() => {
  if (!activeWorkspace || !session) return

  const fetchMembers = async () => {
    const res = await callAPI(
      `/workspace-members?workspace_id=${activeWorkspace.id}`,
      "GET",
      session.access_token
    )
    setMembers(res)
  }

  fetchMembers()
}, [activeWorkspace, session])

useEffect(() => {
  const channel = supabase
    .channel("tasks")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tasks",
      },
      () => {
        fetchTasks()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])

  return (
    <div className="mb-4">
    <div className="flex items-center justify-between mr-3">

<div className="flex flex-col ml-4">
  {/* Row 1: Title */}
  <h1 className="text-2xl font-bold">Kanban App</h1>

  {/* Row 2: Profile */}
  {profile && (
    <div className="flex items-center gap-2 mt-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: profile.color }}
      >
        <img
          src={`/avatars/${profile.avatar}`}
          className="w-7 h-7"
        />
      </div>

      <span className="text-sm font-medium">
        {profile.username}
      </span>
    </div>
  )}
</div>

  {/* RIGHT — WORKSPACES */}
  <div className="flex items-center gap-2">
    {workspaces.map((ws) => {
      const active = activeWorkspace?.id === ws.id

      return (
        <button
          key={ws.id}
          onClick={() => setActiveWorkspace(ws)}
          className={`px-3 py-1 rounded-full text-sm border transition ${
            active
              ? "bg-[#546B41] text-white"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {ws.name}
        </button>
      )
    })}
  </div>
</div>


      <KanbanBoard initialTasks={tasks}
  onEdit={handleEdit}
  editMode={editMode}
  members = {members}
  commentMode={commentMode}
  onSelectTask={setSelectedTask}
/>

   <div>   
      <button
  onClick={() => setShowModal(true)}
  className="bg-[#546B41] text-white px-4 py-2 rounded mb-4 ml-4 hover:bg-[#445634]"
>
  + Add Task
</button>

      <button
    onClick={() => setShowWorkspaceModal(true)}
    className="bg-[#546B41] ml-4 text-white px-4 py-2 rounded hover:bg-[#445634]"
  >
    + Add Workspace
  </button>

  <button
    onClick={() => setEditMode((v) => !v)}
    className={` ml-4 px-4 py-2 rounded border ${
      editMode ? "bg-[#DCCCAC]" : "bg-white"
    } hover:bg-[#DCCCAC]` }
  >
    {isEditing ? "Exit Edit Mode" : "Editing Mode"}
  </button>

        
</div>

{selectedTask && (
  <TaskCommentsModal
    task={selectedTask}
    onClose={() => setSelectedTask(null)}
    session={session}
  />
)}

{showWorkspaceModal && (
  <WorkspaceModal
    onClose={() => setShowWorkspaceModal(false)}
    onCreate={async (data) => {
      const newWs = await callAPI(
        "/workspaces",
        "POST",
        session.access_token,
        data
      )

      setWorkspaces((prev) => [...prev, newWs[0]])
      setActiveWorkspace(newWs[0])
    }}
    session={session}
  />
)}

{showProfileModal && (
  <ProfileSetupModal
    onCreate={async ({ username, avatar, color }) => {
      if (!session) return

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: session.user.id,
          username,
          avatar,
          color,
        })
        .select()
        .single()

      if (error) {
        alert("Username may already exist")
        return
      }

      setProfile(data)
      setShowProfileModal(false)
    }}
  />
)}

<TaskModal
  open={showModal}
  onClose={() => {
    setShowModal(false)
    setEditingTask(null)
  }}
  task={editingTask}
  members={members}
  onSave={async ({ task, assignees }) => {
    if (task.id) {
      const updated = await callAPI("/tasks", "PUT", session.access_token, task)

      await fetchTasks()
      await callAPI("/tasks/assign", "POST", session.access_token, {
        task_id: task.id,
        user_ids: assignees,
      })
    } else {
      const created = await callAPI("/tasks", "POST", session.access_token, {
        ...task,
        status: "todo",
        workspace_id: activeWorkspace?.id,
      })

      await fetchTasks()

      await callAPI("/tasks/assign", "POST", session.access_token, {
        task_id: created[0].id,
        user_ids: assignees,
      })
    }
  }}
/>
    </div>
  )
}
