"use client"

import { useState } from "react"
import AvatarPicker from "@/components/profile/AvatarPicker"
import ColorPicker from "@/components/profile/ColorPicker"

export default function ProfileSetupModal({
  onCreate,
}: {
  onCreate: (data: any) => void
}) {
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("av1.png")
  const [color, setColor] = useState("#99AD7A")
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[420px] shadow-lg">

        <h2 className="text-xl font-bold mb-4">
          Set up your profile
        </h2>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="mb-4">
          <label className="block text-sm mb-1">Avatar</label>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="flex justify-end">
          <button
            disabled={loading || !username}
            className={`px-3 py-1 rounded text-white ${
              loading ? "bg-gray-400" : "bg-[#546B41]"
            }`}
            onClick={async () => {
              if (!username) return
              setLoading(true)

              await onCreate({ username, avatar, color })

              setLoading(false)
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  )
}