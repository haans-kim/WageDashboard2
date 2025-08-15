'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatKoreanCurrency } from '@/lib/utils'

interface TenureAnalysisChartProps {
  data: Array<{
    tenure: string
    employeeCount: number
    averageSalary: number
  }>
}


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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-base font-medium text-slate-900 mb-4">근속년수별 급여 추세</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTenure" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="tenure" 
              tick={{ fontSize: 12, fill: '#64748B' }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              label={{ value: '평균 급여 (만원)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748B' } }}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="averageSalaryDisplay" 
              stroke="#EC4899" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorTenure)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {data.map((item) => (
            <div key={item.tenure} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">{item.tenure}</span>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-900">{item.employeeCount}명</span>
                <p className="text-xs text-slate-500">{formatKoreanCurrency(item.averageSalary, '만원')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}