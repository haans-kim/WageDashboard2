'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { formatKoreanCurrency } from '@/lib/utils'

interface ChartDataPoint {
  level: string
  sblMedian: number
  sblMedianAdjusted?: number  // 조정 후 값
  caMedian: number
}

interface PayBandLineChartProps {
  data: ChartDataPoint[]
  bandName: string
}

export function PayBandLineChart({ data, bandName }: PayBandLineChartProps) {
  // Y축 범위 계산 - 조정된 값도 포함
  const allValues = data.flatMap(d => [
    d.sblMedian, 
    d.sblMedianAdjusted || d.sblMedian,
    d.caMedian
  ])
  const yMin = Math.min(...allValues) * 0.9
  const yMax = Math.max(...allValues) * 1.1

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1">
            {payload.find((p: any) => p.dataKey === 'sblMedian') && (
              <p className="text-xs">
                <span className="text-red-300 font-semibold">SBL (현재):</span>{' '}
                {formatKoreanCurrency(payload.find((p: any) => p.dataKey === 'sblMedian')?.value || 0, '만원')}
              </p>
            )}
            {payload.find((p: any) => p.dataKey === 'sblMedianAdjusted') && (
              <p className="text-xs">
                <span className="text-red-600 font-semibold">SBL (조정 후):</span>{' '}
                {formatKoreanCurrency(payload.find((p: any) => p.dataKey === 'sblMedianAdjusted')?.value || 0, '만원')}
              </p>
            )}
            <p className="text-xs">
              <span className="text-blue-600 font-semibold">C사:</span>{' '}
              {formatKoreanCurrency(payload.find((p: any) => p.dataKey === 'caMedian')?.value || 0, '만원')}
            </p>
            {payload.find((p: any) => p.dataKey === 'sblMedianAdjusted') && (
              <p className="text-xs font-semibold">
                보상경쟁력 (조정 후): {(
                  (payload.find((p: any) => p.dataKey === 'sblMedianAdjusted')?.value / 
                   payload.find((p: any) => p.dataKey === 'caMedian')?.value) * 100
                ).toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="level" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#9ca3af' }}
          />
          
          <YAxis 
            domain={[yMin, yMax]}
            tickFormatter={(value) => `${(value / 10000).toFixed(0)}`}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#9ca3af' }}
            label={{ 
              value: '연봉(만원)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#6b7280' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={30}
            iconType="line"
            wrapperStyle={{ fontSize: '12px' }}
          />
          
          {/* SBL사 현재 중위수 (점선) */}
          <Line
            type="monotone"
            dataKey="sblMedian"
            stroke="#fca5a5"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: '#fca5a5' }}
            activeDot={{ r: 6 }}
            name="SBL사 (현재)"
          />
          
          {/* SBL사 조정 후 중위수 (실선) */}
          {data[0]?.sblMedianAdjusted && (
            <Line
              type="monotone"
              dataKey="sblMedianAdjusted"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 6, fill: '#ef4444' }}
              activeDot={{ r: 8 }}
              name="SBL사 (조정 후)"
            />
          )}
          
          {/* C사 중위수 */}
          <Line
            type="monotone"
            dataKey="caMedian"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#3b82f6' }}
            activeDot={{ r: 7 }}
            name="C사"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}