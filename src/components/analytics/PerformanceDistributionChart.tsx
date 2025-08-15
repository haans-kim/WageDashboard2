'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface PerformanceDistributionChartProps {
  data: Array<{
    rating: string
    count: number
    percentage: number
  }>
}

const COLORS = {
  'S': '#10b981',  // emerald-500
  'A': '#3b82f6',  // blue-500
  'B': '#f59e0b',  // amber-500
  'C': '#ef4444'   // red-500
}

export function PerformanceDistributionChart({ data }: PerformanceDistributionChartProps) {
  const chartData = data.map(item => ({
    name: `${item.rating}등급`,
    value: item.count,
    percentage: item.percentage
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            인원: {payload[0].value.toLocaleString('ko-KR')}명
          </p>
          <p className="text-sm text-gray-600">
            비율: {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">평가등급 분포</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name.charAt(0) as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* 요약 통계 */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {data.map((item) => (
          <div key={item.rating} className="text-center p-2 bg-gray-50 rounded">
            <div 
              className="text-lg font-bold"
              style={{ color: COLORS[item.rating as keyof typeof COLORS] }}
            >
              {item.rating}
            </div>
            <div className="text-sm text-gray-600">
              {item.count}명
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}