'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatKoreanCurrency } from '@/lib/utils'

interface BudgetBarChartProps {
  data: Array<{
    level: string
    employeeCount: number
    totalSalary: string
    totalIncreasePercentage: number
  }>
}

export function BudgetBarChart({ data }: BudgetBarChartProps) {
  const chartData = data.map(item => ({
    level: item.level,
    현재급여: Number(item.totalSalary) / 100000000, // 억 단위로 변환
    예상급여: (Number(item.totalSalary) * (1 + item.totalIncreasePercentage / 100)) / 100000000,
    인상액: (Number(item.totalSalary) * item.totalIncreasePercentage / 100) / 100000000,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold mb-2">{label}</p>
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
      <h2 className="text-xl font-semibold mb-4">직급별 예산 현황</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="level" />
          <YAxis 
            tickFormatter={(value) => `${value.toFixed(0)}억`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="현재급여" fill="#94a3b8" />
          <Bar dataKey="예상급여" fill="#0ea5e9" />
          <Bar dataKey="인상액" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}