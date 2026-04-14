"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { callAPI } from "@/lib/api"
import KanbanBoard from "@/components/KanbanBoard"
import DatePicker from "react-datepicker"

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

  const isEditing = !!editingTask
  const handleEdit = (task: any) => {
  setEditingTask(task)
  setTitle(task.title)
  setDescription(task.description)
  setPriority(task.priority || "normal")
  setDueDate(task.due_date ? new Date(task.due_date) : null)
  setShowModal(true)
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
      await callAPI("/init-user", "POST", currentSession.access_token)

      const fetchedTasks = await callAPI(
        "/tasks",
        "GET",
        currentSession.access_token
      )

      console.log("Fetched tasks:", fetchedTasks)

      setTasks(fetchedTasks)
    }
  }
  init()
}, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kanban App</h1>

      <KanbanBoard
  initialTasks={tasks}
  onEdit={handleEdit}
  editMode={editMode}
/>
   <div>   
      <button
  onClick={() => setShowModal(true)}
  className="bg-[#546B41] text-white px-4 py-2 rounded mb-4"
>
  + Add Task
</button>

  <button
    onClick={() => setEditMode((v) => !v)}
    className={` ml-4 px-4 py-2 rounded border ${
      editMode ? "bg-[#DCCCAC]" : "bg-white"
    }`}
  >
    {editMode ? "Exit Edit Mode" : "Editing Mode"}
  </button>
</div>


{showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded w-[400px]">
      
      <h2 className="text-xl font-bold mb-4">{editMode ? "Edit Task" : "Create Task"}</h2>

      <input
        className="w-full border p-2 mb-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2 mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
<div className="mb-2">
  <label className="block text-sm font-medium mb-1">
    Priority
  </label>

  <select
    className="w-full border p-2"
    value={priority}
    onChange={(e) => setPriority(e.target.value)}
  >
    <option value="low">Low</option>
    <option value="normal">Normal</option>
    <option value="high">High</option>
  </select>
</div>

<div className="mb-2">
  <label className="block text-sm font-medium mb-1">
    Due Date
  </label>

  <DatePicker
    selected={dueDate}
    onChange={(date) => setDueDate(date)}
    className="w-full border p-2 rounded"
    placeholderText="mm/dd/yyyy"
  />
</div>
      

      <div className="flex justify-end gap-2">
        <button onClick={() => setShowModal(false)}>
          Cancel
        </button>

<button
  disabled={loading}
  className={`px-3 py-1 rounded text-white flex items-center justify-center gap-2 ${
    loading ? "bg-gray-400" : "bg-[#99AD7A]"
  }`}
onClick={async () => {
  if (!session || loading) return
  setLoading(true)

  try {
    if (isEditing) {
      const updated = await callAPI(
        "/tasks",
        "PUT",
        session.access_token,
        {
          id: editingTask.id,
          title,
          description,
          priority,
          due_date: dueDate ? dueDate.toISOString() : null,
        }
      )

      setTasks((prev) =>
        prev.map((t) => (t.id === updated[0].id ? updated[0] : t))
      )
    } else {
      const newTask = await callAPI(
        "/tasks",
        "POST",
        session.access_token,
        {
          title,
          description,
          status: "todo",
          priority,
          due_date: dueDate ? dueDate.toISOString() : null,
        }
      )

      setTasks((prev) => [...prev, newTask[0]])
    }

    // reset
    setTitle("")
    setDescription("")
    setPriority("normal")
    setDueDate(null)
    setEditingTask(null)
    setShowModal(false)

  } finally {
    setLoading(false)
  }
}}
>
  {loading ? (
    <span className="animate-pulse">Saving...</span>
  ) : (
   editingTask ? "Update" : "Create"
  )}
</button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}