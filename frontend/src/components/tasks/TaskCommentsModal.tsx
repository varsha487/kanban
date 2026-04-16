"use client"

import { useEffect, useState } from "react"
import { callAPI } from "@/lib/api"

export default function TaskCommentsModal({ task, session, onClose }: any) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState("")

const fetchComments = async () => {
  const res = await callAPI(
    `/task-comments?task_id=${task.id}`,
    "GET",
    session.access_token
  )

  setComments(res)
}

useEffect(() => {
  if (!session?.access_token || !task?.id) return

  fetchComments()
}, [task, session])

  const addComment = async () => {
    
    await callAPI("/task-comments", "POST", session.access_token, {
      task_id: task.id,
      content: text,
    })

    setText("")
    fetchComments()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white w-[420px] p-4 rounded">

        <h2 className="font-bold mb-2">{task.title}</h2>

        {/* comments */}
        <div className="max-h-[300px] overflow-y-auto mb-3">
          {comments.map((c: any) => (
            <div key={c.id} className="mb-2 border-b pb-2">
              <div className="text-sm font-medium">
                {c.username}
                
              </div>
              <div className="text-sm">{c.content}</div>
              <div className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* input */}
        <textarea
          className="w-full border p-2 mb-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write comment..."
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Close</button>

          <button
            onClick={addComment}
            className="bg-[#546B41] text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}