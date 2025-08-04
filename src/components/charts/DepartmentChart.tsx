'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DepartmentChartProps {
  data: Array<{
    department: string
    count: number
  }>
}

export function DepartmentChart({ data }: DepartmentChartProps) {
  const sortedData = [...data].sort((a, b) => b.count - a.count)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold">{payload[0].payload.department}</p>
          <p className="text-sm text-gray-600">
            인원: {payload[0].value}명
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">부서별 인원 현황</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart 
          data={sortedData} 
          layout="horizontal"
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="department" type="category" width={60} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}