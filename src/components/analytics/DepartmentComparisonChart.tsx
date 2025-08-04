'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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
    '평균': item.averageSalary / 10000,
    '최소': item.minSalary / 10000,
    '최대': item.maxSalary / 10000,
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">부서별 급여 비교</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="department" 
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            label={{ value: '급여 (만원)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="평균" fill="#0ea5e9" />
          <Bar dataKey="최소" fill="#94a3b8" />
          <Bar dataKey="최대" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}