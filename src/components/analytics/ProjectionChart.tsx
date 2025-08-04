'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatKoreanCurrency } from '@/lib/utils'

interface ProjectionChartProps {
  data: Array<{
    rate: number
    totalCurrent: number
    totalProjected: number
    increase: number
  }>
}

export function ProjectionChart({ data }: ProjectionChartProps) {
  const chartData = data.map(item => ({
    rate: item.rate,
    '현재 총액': item.totalCurrent / 100000000, // 억 단위
    '예상 총액': item.totalProjected / 100000000,
    '인상액': item.increase / 100000000,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold mb-2">인상률: {label}%</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatKoreanCurrency(entry.value * 100000000, '억원')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">인상률별 예산 영향 분석</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="rate" 
            label={{ value: '인상률 (%)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: '금액 (억원)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="현재 총액" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="예상 총액" 
            stroke="#0ea5e9" 
            strokeWidth={3}
          />
          <Line 
            type="monotone" 
            dataKey="인상액" 
            stroke="#10b981" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}