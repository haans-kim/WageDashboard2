'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatKoreanCurrency } from '@/lib/utils'

interface PerformanceSalaryChartProps {
  data: Array<{
    rating: string
    averageSalary: number
    count: number
  }>
}

export function PerformanceSalaryChart({ data }: PerformanceSalaryChartProps) {
  const chartData = data.map(item => ({
    name: `${item.rating}등급`,
    평균급여: item.averageSalary,
    인원수: item.count
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold mb-1">{payload[0].payload.name}</p>
          <p className="text-sm text-blue-600">
            평균급여: {formatKoreanCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600">
            인원: {payload[0].payload.인원수.toLocaleString('ko-KR')}명
          </p>
        </div>
      )
    }
    return null
  }

  const formatYAxis = (value: number) => {
    return `${(value / 100000000).toFixed(1)}억`
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">평가등급별 평균 급여</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="평균급여" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
      
      {/* 인사이트 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">인사이트:</span> 
          {data.length > 0 && (
            <span>
              {' '}S등급과 C등급의 급여 차이는{' '}
              {formatKoreanCurrency(
                (data.find(d => d.rating === 'S')?.averageSalary || 0) - 
                (data.find(d => d.rating === 'C')?.averageSalary || 0)
              )}입니다.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}