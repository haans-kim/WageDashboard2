'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatKoreanCurrency } from '@/lib/utils'

interface TenureAnalysisChartProps {
  data: Array<{
    tenure: string
    employeeCount: number
    averageSalary: number
  }>
}

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6']

export function TenureAnalysisChart({ data }: TenureAnalysisChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-semibold">{payload[0].payload.tenure}</p>
          <p className="text-sm text-gray-600">인원: {payload[0].payload.employeeCount}명</p>
          <p className="text-sm">평균 급여: {formatKoreanCurrency(payload[0].value * 10000, '만원')}</p>
        </div>
      )
    }
    return null
  }

  const chartData = data.map(item => ({
    ...item,
    averageSalaryDisplay: item.averageSalary / 10000, // 만원 단위
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">근속년수별 급여 분석</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tenure" />
          <YAxis 
            label={{ value: '평균 급여 (만원)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="averageSalaryDisplay">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={item.tenure} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">{item.tenure}</span>
            </div>
            <span className="text-sm font-medium">{item.employeeCount}명</span>
          </div>
        ))}
      </div>
    </div>
  )
}