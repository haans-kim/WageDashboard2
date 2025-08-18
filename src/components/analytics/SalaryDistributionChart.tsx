'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-base font-medium text-slate-900 mb-4">급여 분포 추이</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="range" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11, fill: '#64748B' }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748B' }}
              domain={[0, 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#6366F1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSalary)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}