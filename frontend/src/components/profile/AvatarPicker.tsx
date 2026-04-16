export default function AvatarPicker({ value, onChange }: any) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {[...Array(10)].map((_, i) => {
        const name = `av${i + 1}.png`
        return (
          <img
            key={name}
            src={`/avatars/${name}`}
            onClick={() => onChange(name)}
            className={`w-10 h-10 rounded-full cursor-pointer border ${
              value === name ? "border-black" : "border-transparent"
            }`}
          />
        )
      })}
    </div>
  )
}