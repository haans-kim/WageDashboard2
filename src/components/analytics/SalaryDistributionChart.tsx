'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SalaryDistributionChartProps {
  data: Array<{
    range: string
    count: number
  }>
}

export function SalaryDistributionChart({ data }: SalaryDistributionChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold">{payload[0].payload.range}</p>
          <p className="text-sm text-gray-600">
            인원: {payload[0].value}명
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">급여 분포</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="range" 
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}