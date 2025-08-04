'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatPercentage } from '@/lib/utils'

interface PerformanceChartProps {
  data: Array<{
    rating: string
    count: number
  }>
}

const COLORS = {
  'S': '#dc2626', // red-600
  'A': '#0ea5e9', // primary-500
  'B': '#10b981', // emerald-500
  'C': '#f59e0b', // amber-500
}

const RATING_LABELS = {
  'S': '최우수',
  'A': '우수',
  'B': '보통',
  'C': '개선필요'
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const totalEmployees = data.reduce((sum, item) => sum + item.count, 0)
  
  const chartData = data.map(item => ({
    name: RATING_LABELS[item.rating as keyof typeof RATING_LABELS] || item.rating,
    rating: item.rating,
    value: item.count,
    percentage: (item.count / totalEmployees) * 100
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold">{payload[0].name} ({payload[0].payload.rating})</p>
          <p className="text-sm text-gray-600">
            인원: {payload[0].value}명
          </p>
          <p className="text-sm text-gray-600">
            비율: {formatPercentage(payload[0].payload.percentage)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">성과 등급 분포</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.rating as keyof typeof COLORS] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => `${value} (${formatPercentage(entry.payload.percentage)})`}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((item) => (
          <div key={item.rating} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[item.rating as keyof typeof COLORS] || '#94a3b8' }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <span className="text-sm text-gray-600">{item.value}명</span>
          </div>
        ))}
      </div>
    </div>
  )
}