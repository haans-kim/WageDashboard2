'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatPercentage } from '@/lib/utils'

interface LevelPieChartProps {
  data: Array<{
    level: string
    employeeCount: number
  }>
}

const COLORS = {
  'Lv.1': '#9333ea', // purple-600
  'Lv.2': '#3b82f6', // blue-500
  'Lv.3': '#10b981', // emerald-500
  'Lv.4': '#f97316', // orange-500
}

export function LevelPieChart({ data }: LevelPieChartProps) {
  const totalEmployees = data.reduce((sum, item) => sum + item.employeeCount, 0)
  
  const chartData = data.map(item => ({
    name: item.level,
    value: item.employeeCount,
    percentage: (item.employeeCount / totalEmployees) * 100
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold">{payload[0].name}</p>
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

  const renderCustomLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}명`
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">직급별 인원 분포</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
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
    </div>
  )
}