export default function WorkspacePanel({
  workspaces,
  activeWorkspace,
  setActiveWorkspace,
  onCreate,
}: any) {
  return (
    <div className="w-[260px] bg-[#F7F4EC] border-l p-4 flex flex-col">
      
      <h2 className="font-bold mb-3">Workspaces</h2>

      <div className="flex-1 space-y-2">
        {workspaces.map((ws: any) => (
          <div
            key={ws.id}
            onClick={() => setActiveWorkspace(ws)}
            className={`p-2 rounded cursor-pointer flex items-center gap-2 ${
              activeWorkspace?.id === ws.id
                ? "bg-[#DCCCAC]"
                : "hover:bg-[#EEE6D8]"
            }`}
          >
                
            <span>{ws.name}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onCreate}
        className="mt-4 bg-[#546B41] text-white py-2 rounded"
      >
        + New Workspace
      </button>
    </div>
  )
}