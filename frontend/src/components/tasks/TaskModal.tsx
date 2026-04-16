"use client"

import { useEffect, useState } from "react"
import DatePicker from "react-datepicker"

type Member = {
  user_id: string
  username: string
  avatar: string
  color: string
}

type Task = {
  id?: string
  title: string
  description?: string
  priority?: string
  due_date?: string | null
  assignees?: string[]
}

export default function TaskModal({
  open,
  onClose,
  onSave,
  task,
  members,
  loading,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: {
    task: Task
    assignees: string[]
  }) => Promise<void>
  task?: any
  members: Member[]
  loading?: boolean
}) {
  const isEditing = !!task

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("normal")
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])
  const [saving, setSaving] = useState(false)


  useEffect(() => {
    if (!task) return

    setTitle(task.title || "")
    setDescription(task.description || "")
    setPriority(task.priority || "normal")
    setDueDate(task.due_date ? new Date(task.due_date) : null)
    setAssignedUsers(task.assignees || [])
  }, [task])

  if (!open) return null

  const handleSave = async () => {
    if (saving) return
    setSaving(true)

    try {
      await onSave({
        task: {
          id: task?.id,
          title,
          description,
          priority,
          due_date: dueDate ? dueDate.toISOString() : null,
        },
        assignees: assignedUsers,
      })

      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[420px]">

        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Task" : "Create Task"}
        </h2>

        {/* Title */}
        <input
          className="w-full border p-2 mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <textarea
          className="w-full border p-2 mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Priority */}
        <select
          className="w-full border p-2 mb-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>

        {/* Due date */}
        <div className="mb-3">
          <DatePicker
            selected={dueDate}
            onChange={(date: Date | null) => setDueDate(date)}
            className="w-full border p-2 rounded"
            placeholderText="Due date"
          />
        </div>

        {/* Assignees */}
        <div className="mb-3">
          <label className="text-sm font-medium">Assign Users</label>

          <div className="flex flex-wrap gap-2 mt-2">
            {members.map((m) => {
              const selected = assignedUsers.includes(m.user_id)
              console.log("Rendering member:", m)

              return (
                <div
                  key={m.user_id}
                  onClick={() => {
                    setAssignedUsers((prev) =>
                      selected
                        ? prev.filter((id) => id !== m.user_id)
                        : [...prev, m.user_id]
                    )
                    
                  }}
                  className={`cursor-pointer px-2 py-1 rounded flex items-center gap-2 border ${
                    selected ? "bg-[#DCCCAC]" : "bg-white"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: m.color }}
                  >
                    <img
                      src={`/avatars/${m.avatar}`}
                      className="w-4 h-4"
                    />
                  </div>

                  <span className="text-sm">
                    {m.username}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 ">
          <button onClick={onClose}>
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={handleSave}
            className={`px-3 py-1 rounded text-white ${
              saving ? "bg-gray-400" : "bg-[#99AD7A]"
            } `}
          >
            {saving
              ? "Saving..."
              : isEditing
              ? "Update"
              : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}
