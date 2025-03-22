"use client"

import { useEffect, useRef } from "react"

interface AntennaGraphProps {
  antennas: string[]
  constraints: Array<[string, string]>
  frequencies: Record<string, number>
}

export function AntennaGraph({ antennas, constraints, frequencies }: AntennaGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate positions for antennas in a circle
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 50
    const positions: Record<string, { x: number; y: number }> = {}

    antennas.forEach((antenna, index) => {
      const angle = (index / antennas.length) * 2 * Math.PI
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      positions[antenna] = { x, y }
    })

    // Draw constraints (edges)
    ctx.strokeStyle = "#888"
    ctx.lineWidth = 1
    constraints.forEach(([a1, a2]) => {
      if (positions[a1] && positions[a2]) {
        ctx.beginPath()
        ctx.moveTo(positions[a1].x, positions[a1].y)
        ctx.lineTo(positions[a2].x, positions[a2].y)
        ctx.stroke()
      }
    })

    // Draw antennas (nodes)
    antennas.forEach((antenna) => {
      const { x, y } = positions[antenna]

      // Draw node
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, 2 * Math.PI)

      // Color based on frequency
      if (frequencies[antenna]) {
        const colors = [
          "#ef4444", // red
          "#3b82f6", // blue
          "#22c55e", // green
          "#eab308", // yellow
          "#a855f7", // purple
          "#ec4899", // pink
          "#6366f1", // indigo
          "#f97316", // orange
          "#14b8a6", // teal
          "#06b6d4", // cyan
        ]
        ctx.fillStyle = colors[(frequencies[antenna] - 1) % colors.length]
      } else {
        ctx.fillStyle = "#e5e7eb" // gray-200
      }

      ctx.fill()
      ctx.stroke()

      // Draw antenna label
      ctx.fillStyle = "#000"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(antenna, x, y)

      // Draw frequency if available
      if (frequencies[antenna]) {
        ctx.font = "10px sans-serif"
        ctx.fillText(`F${frequencies[antenna]}`, x, y + 15)
      }
    })
  }, [antennas, constraints, frequencies])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

