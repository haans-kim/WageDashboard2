'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatKoreanCurrency } from '@/lib/utils'

interface DepartmentComparisonChartProps {
  data: Array<{
    department: string
    averageSalary: number
    minSalary: number
    maxSalary: number
    employeeCount: number
  }>
}

export function DepartmentComparisonChart({ data }: DepartmentComparisonChartProps) {
  const chartData = data.map(item => ({
    department: item.department,
    '평균급여': item.averageSalary / 10000,
    '최소급여': item.minSalary / 10000,
    '최대급여': item.maxSalary / 10000,
    인원: item.employeeCount,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const originalData = data.find(d => d.department === label)
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm text-gray-600">인원: {originalData?.employeeCount}명</p>
          <p className="text-sm">평균: {formatKoreanCurrency(originalData?.averageSalary || 0, '만원')}</p>
          <p className="text-sm">최소: {formatKoreanCurrency(originalData?.minSalary || 0, '만원')}</p>
          <p className="text-sm">최대: {formatKoreanCurrency(originalData?.maxSalary || 0, '만원')}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-base font-medium text-slate-900 mb-4">부서별 급여 추세</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="department" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 10, fill: '#64748B' }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              label={{ value: '급여 (만원)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748B' } }}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="평균급여" 
              stroke="#6366F1" 
              strokeWidth={2.5}
              dot={{ fill: '#6366F1', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="최소급여" 
              stroke="#94A3B8" 
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={{ fill: '#94A3B8', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="최대급여" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}