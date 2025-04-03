"use client";

import { useEffect, useRef, useState } from "react";
import { RadioTower } from "lucide-react";

interface AntennaGraphProps {
  antennas: string[];
  constraints: Array<[string, string]>;
  frequencies: Record<string, number>;
}

export function AntennaGraph({
  antennas,
  constraints,
  frequencies,
}: AntennaGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // Calculate positions only once when antennas change
  useEffect(() => {
    const calculatePositions = () => {
      const canvas = canvasRef.current;
      if (!canvas) return {};

      const minGap = 50; // Minimum gap between antennas
      const positions: Record<string, { x: number; y: number }> = {};

      const isOverlapping = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        minDistance: number
      ) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      };

      antennas.forEach((antenna) => {
        let x, y;
        let isValidPosition = false;

        // Keep generating random positions until a valid one is found
        while (!isValidPosition) {
          x = Math.random() * (canvas.width - 40) + 20; // Ensure antennas stay within canvas bounds
          y = Math.random() * (canvas.height - 40) + 20;

          // Check if the position is valid (not overlapping with others)
          isValidPosition = Object.values(positions).every(
            (pos) => !isOverlapping(x, y, pos.x, pos.y, minGap)
          );
        }

        positions[antenna] = { x, y };
      });

      return positions;
    };

    setPositions(calculatePositions());
  }, [antennas]);

  // Draw the graph
  useEffect(() => {
    if (!canvasRef.current || Object.keys(positions).length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw constraints (edges)
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    constraints.forEach(([a1, a2]) => {
      if (positions[a1] && positions[a2]) {
        ctx.beginPath();
        ctx.moveTo(positions[a1].x, positions[a1].y);
        ctx.lineTo(positions[a2].x, positions[a2].y);
        ctx.stroke();
      }
    });
  }, [positions, constraints]);

  return (
    <div className="relative w-full h-full">
      {/* Canvas for edges */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

      {/* Icons for antennas */}
      {Object.entries(positions).map(([antenna, { x, y }]) => {
        // Determine color based on frequency
        let color = "#e5e7eb"; // Default gray color
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
          ];
          color = colors[(frequencies[antenna] - 1) % colors.length];
        }

        return (
          <div
            key={antenna}
            className="absolute"
            style={{
              top: y - 20, // Adjust to center the icon
              left: x - 20, // Adjust to center the icon
              color: color,
            }}
          >
            <RadioTower size={40} />
            <div
              className="text-center text-sm"
              style={{ marginTop: "5px", color: "#000" }}
            >
              {antenna}
              {frequencies[antenna] && (
                <div style={{ fontSize: "10px" }}>F{frequencies[antenna]}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
