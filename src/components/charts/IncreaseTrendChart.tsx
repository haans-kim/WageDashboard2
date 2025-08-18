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
  // Lv.1 ~ Lv.4 순서로 정렬
  const sortedData = [...data].sort((a, b) => {
    const aNum = parseInt(a.level.replace('Lv.', ''))
    const bNum = parseInt(b.level.replace('Lv.', ''))
    return aNum - bNum
  })
  
  const chartData = sortedData.map(item => ({
    level: item.level,
    'Base-up': item.avgBaseUpPercentage,
    '성과 인상률': item.avgMeritPercentage,
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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-base font-medium text-slate-900 mb-4">직급별 인상률 추이</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="level" 
              tick={{ fontSize: 12, fill: '#64748B' }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'dataMax + 1']}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="Base-up" 
              stroke="#6366F1" 
              strokeWidth={2}
              dot={{ fill: '#6366F1', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="성과 인상률" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="총 인상률" 
              stroke="#EC4899" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#EC4899', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}