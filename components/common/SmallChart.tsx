'use client'

interface SmallChartProps {
  data?: number[]
  color?: string
  height?: number
}

export default function SmallChart({
  data = [4, 6, 5, 8, 7, 9, 6, 10, 8, 12],
  color = '#3b82f6',
  height = 160,
}: SmallChartProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((d - min) / range) * 80 - 10
      return `${x},${y}`
    })
    .join(' ')

  const areaPoints = `0,100 ${points} 100,100`

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#chartGradient)" points={areaPoints} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100
          const y = 100 - ((d - min) / range) * 80 - 10
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="opacity-0 hover:opacity-100 transition-opacity"
            />
          )
        })}
      </svg>
    </div>
  )
}
