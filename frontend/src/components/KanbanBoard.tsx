"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core"

import { supabase } from "@/lib/supabaseClient"

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "done", title: "Done" },
]

function getPriorityStyle(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200"
    case "normal":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

function formatDate(dateStr: string) {

  const date = new Date(dateStr)

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}


function TaskCard({ task, onEdit, onDelete, editMode, deletingIds, members, onSelectTask, commentMode }: any) {
const { attributes, listeners, setNodeRef, transform } = useDraggable({
  id: task.id,
  disabled: editMode || commentMode,
})

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined

    const border =
  task.priority === "high"
    ? "border-l-4 border-red-400"
    : task.priority === "low"
    ? "border-l-4 border-green-400"
    : "border-l-4 border-yellow-400"

  return (
    
<div
  ref={setNodeRef}
        onClick={() => {
    if (commentMode) {
      onSelectTask?.(task)
    }
  }}
      style={style}
className={`bg-white p-3 rounded shadow mb-2 cursor-grab transition-all duration-300 ${border} relative ${
    deletingIds.includes(task.id)
      ? "opacity-0 scale-95"
      : "opacity-100 scale-100"
  }`}    >
<div
  {...listeners}
  {...attributes}
  className="cursor-grab text-xs text-gray-400 mb-1 select-none"
>
  ⋮⋮
</div>


    {task.due_date && (
  <div className="absolute top-2 right-2 text-xs text-gray-500">
    Due {formatDate(task.due_date)}
  </div>
)}

<div
  onClick={(e) => {
    e.stopPropagation()
    onSelectTask?.(task)
  }}
  className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-gray-200 hover:bg-gray-300 transition px-2 py-1 rounded-full cursor-pointer"
>
  💬 {task.comment_count || 0}
</div>
      {task.title}
      <div className="text-sm text-gray-500">{task.description}</div>


      
      <div
  className={`inline-block mb-2 mt-2 px-2 py-1 text-xs rounded-full border ${getPriorityStyle(
    task.priority
  )}`}
>
  {task.priority || "normal"}
</div>

<div className="flex items-center gap-1">
  {task.task_assignees?.map((a: any) => {
    const u = a.profiles

    return (
      <div
        key={u.id}
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: u.color }}
      >
        <img
          src={`/avatars/${u.avatar}`}
          className="w-6 h-6"
        />
      </div>
    )
  })}
</div>

<div className="flex items-center gap-2 mt-2">
  <span className="text-xs text-gray-400">Owner:</span>

  {task.owner && (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center"
      style={{ backgroundColor: task.owner.color }}
    >
      <img
        src={`/avatars/${task.owner.avatar}`}
        className="w-5 h-5"
      />
    </div>
  )}
</div>


{editMode && (
  <div className="flex gap-2 mt-2">
  <button
    onClick={() => onEdit(task)}
    className="text-xs px-2 py-1 bg-[#99AD7A] text-white rounded"
  >
    Edit
  </button>

  <button
    onClick={() => onDelete(task.id)}
    className="text-xs px-2 py-1 bg-red-400 text-white rounded"
  >
    Delete
  </button>
</div>
  )
}
<div>

</div>
    </div>
  )
}


function Column({ column, tasks, onEdit, onDelete, editMode, deletingIds, members, commentMode, onSelectTask }: any) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
<div
  ref={setNodeRef}
  className="bg-[#FFF8EC] p-3 rounded-xl h-[75vh] overflow-y-auto border-3 border-[#DCCCAC] shadow-sm"
>
      <h2 className="font-bold mb-3 text-[#546B41] border-b border-[#DCCCAC] pb-2">
        {column.title}
      </h2>

      {tasks.map((task: any) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} editMode={editMode} deletingIds={deletingIds}
        commentMode={commentMode} onSelectTask={onSelectTask}
        />
      ))}
    </div>
  )
}


export default function KanbanBoard({ initialTasks, onEdit, editMode, members, commentMode, onSelectTask }: any) {
  const [tasks, setTasks] = useState(initialTasks || [])
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const handleDelete = async (taskId: string) => {
  // trigger animation
  setDeletingIds((prev) => [...prev, taskId])

  setTimeout(async () => {
    // remove from UI
    setTasks((prev: any) => prev.filter((t: any) => t.id !== taskId))

    // delete from DB
    await supabase.from("tasks").delete().eq("id", taskId)

    // cleanup
    setDeletingIds((prev) => prev.filter((id) => id !== taskId))
  }, 300)
}
  useEffect(() => {
  setTasks(initialTasks || [])
}, [initialTasks])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    console.log("drag event:", event)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as string

    
    //ui
    setTasks((prev: any) =>
      prev.map((t: any) =>
        t.id === taskId ? { ...t, status: newStatus } : t
    
      )
      
    )

    //supabase
const {data, error} =  await supabase
  .from("tasks")
  .update({ status: newStatus })
  .eq("id", taskId)
  .select()

console.log("Drag update error:", error)
console.log("Drag update data:", data)
  }
  


  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4 p-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            column={col}
            tasks={tasks.filter((t: any) => t.status === col.id)}
            onEdit={onEdit}
            onDelete={handleDelete}
            editMode={editMode}
            deletingIds={deletingIds} 
            commentMode={commentMode}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </DndContext>
  )
} 