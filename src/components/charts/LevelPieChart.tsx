'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatPercentage } from '@/lib/utils'

interface LevelPieChartProps {
  data: Array<{
    level: string
    employeeCount?: number
    count?: number
    percentage?: number
  }>
}

const COLORS = {
  'Lv.1': '#6366F1', // indigo-500
  'Lv.2': '#8B5CF6', // violet-500
  'Lv.3': '#A78BFA', // violet-400
  'Lv.4': '#C4B5FD', // violet-300
}

export function LevelPieChart({ data }: LevelPieChartProps) {
  const totalEmployees = data.reduce((sum, item) => sum + (item.employeeCount || item.count || 0), 0)
  
  const chartData = data.map(item => ({
    name: item.level,
    value: item.employeeCount || item.count || 0,
    percentage: item.percentage || ((item.employeeCount || item.count || 0) / totalEmployees) * 100
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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-base font-medium text-slate-900 mb-4">직급별 인원 분포</h2>
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
              formatter={(value, entry: any) => `${value} (${formatPercentage(entry.payload?.percentage || 0)})`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}