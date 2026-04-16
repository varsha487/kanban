"use client"

import { useState, useEffect } from "react"

export default function WorkspaceModal({
  onClose,
  onCreate,
  session,
}: {
  onClose: () => void
  onCreate: (workspace: any) => void
  session: any
}) {
  const [loading, setLoading] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
const [invitedUsers, setInvitedUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
  if (!search) {
    setResults([])
    setNotFound(false)
    return
  }

  const runSearch = async () => {
    setSearching(true)

    const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}:5000/users/search?q=${search}`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  }
)
    const data = await res.json()

    setResults(data)
    setNotFound(data.length === 0)

    setSearching(false)
  }

  const debounce = setTimeout(runSearch, 300)
  return () => clearTimeout(debounce)
}, [search])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[420px] shadow-lg">
        
       
        <h2 className="text-xl font-bold mb-4">
          Create Workspace
        </h2>
<input
  className="w-full border p-2 mb-3 rounded"
  placeholder="Workspace name"
  value={workspaceName}
  onChange={(e) => setWorkspaceName(e.target.value)}
/>
       
<div className="border-t my-3"></div>
        <h3 className="font-semibold mb-2">Invite People</h3>

<input
  className="w-full border p-2 mb-2 rounded"
  placeholder="Search users..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

<div className="max-h-40 overflow-y-auto border rounded mb-2">
  {searching && <div className="p-2 text-sm">Searching...</div>}

  {notFound && (
    <div className="p-2 text-sm text-gray-500">
      No users found
    </div>
  )}

  {results.map((user) => (
    <div
      key={user.id}
      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
      onClick={() => {
        if (!invitedUsers.find((u) => u.id === user.id)) {
          setInvitedUsers((prev) => [...prev, user])
        }
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: user.color }}
      >
        <img src={`/avatars/${user.avatar}`} className="w-4 h-4" />
      </div>
      <span>{user.username}</span>
    </div>
  ))}
</div>

<div className="flex flex-wrap gap-2">
  {invitedUsers.map((u) => (
    <div key={u.id} className="bg-gray-200 px-2 py-1 rounded text-sm">
      {u.username}
    </div>
  ))}
</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1"
          >
            Cancel
          </button>

          <button
            disabled={loading || !workspaceName}
            className={`px-3 py-1 rounded text-white ${
              loading ? "bg-gray-400" : "bg-[#546B41]"
            }`}
            onClick={async () => {
              if (!workspaceName || loading) return

              setLoading(true)

              try {
              
                await onCreate({
                  workspaceName,
                  invitedUsers,
                })

                onClose()
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}
