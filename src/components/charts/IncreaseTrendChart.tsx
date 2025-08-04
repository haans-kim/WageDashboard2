'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatPercentage } from '@/lib/utils'

interface IncreaseTrendChartProps {
  data: Array<{
    level: string
    avgBaseUpPercentage: number
    avgMeritPercentage: number
    totalIncreasePercentage: number
  }>
}

export function IncreaseTrendChart({ data }: IncreaseTrendChartProps) {
  const chartData = data.map(item => ({
    level: item.level,
    'Base-up': item.avgBaseUpPercentage,
    'Merit': item.avgMeritPercentage,
    '총 인상률': item.totalIncreasePercentage,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatPercentage(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">직급별 인상률 추이</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="level" />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'dataMax + 1']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Base-up" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="Merit" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="총 인상률" 
            stroke="#dc2626" 
            strokeWidth={3}
            dot={{ fill: '#dc2626', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}