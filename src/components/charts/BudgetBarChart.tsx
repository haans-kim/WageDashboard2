'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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
  // Lv.1 ~ Lv.4 순서로 정렬
  const sortedData = [...data].sort((a, b) => {
    const aNum = parseInt(a.level.replace('Lv.', ''))
    const bNum = parseInt(b.level.replace('Lv.', ''))
    return aNum - bNum
  })
  
  const chartData = sortedData.map(item => ({
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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-base font-medium text-slate-900 mb-4">직급별 예산 현황</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="level" 
              tick={{ fontSize: 12, fill: '#64748B' }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              tickFormatter={(value) => `${value.toFixed(0)}억`}
              tick={{ fontSize: 11, fill: '#64748B' }}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="현재급여" 
              stroke="#94A3B8" 
              strokeWidth={2}
              dot={{ fill: '#94A3B8', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="예상급여" 
              stroke="#6366F1" 
              strokeWidth={2}
              dot={{ fill: '#6366F1', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="인상액" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}