"use client"

const COLORS = [
  "#99AD7A", 
  "#F2C6C2", 
  "#F7E1AE", 
  "#CDE7F0", 
  "#D6CDEA", 
  "#FFD6A5", 
  "#BDE0FE", 
  "#FFC8DD", 
  "#E2F0CB",
  "#D3D3D3", 
]

export default function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full border-2 transition ${
            value === color
              ? "border-black scale-110"
              : "border-transparent"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}