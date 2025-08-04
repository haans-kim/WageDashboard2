'use client'

import { formatPercentage } from '@/lib/utils'

interface AIRecommendationCardProps {
  data: {
    baseUpPercentage: number
    meritIncreasePercentage: number
    totalPercentage: number
    minRange: number
    maxRange: number
  } | null
  totalEmployees: number
}

export function AIRecommendationCard({ data, totalEmployees }: AIRecommendationCardProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">AI 제안 적정 인상률</h2>
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI 제안 적정 인상률</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">총 인원</span>
          <span className="font-semibold font-tabular">{totalEmployees.toLocaleString('ko-KR')}명</span>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">최적 인상률</p>
            <p className="text-3xl font-bold text-blue-600 font-tabular">
              {formatPercentage(data.totalPercentage)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Range {formatPercentage(data.minRange)}~{formatPercentage(data.maxRange)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Base-up</span>
            <span className="font-semibold font-tabular">{formatPercentage(data.baseUpPercentage)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full"
              style={{ width: `${(data.baseUpPercentage / data.totalPercentage) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Merit increase</span>
            <span className="font-semibold font-tabular">{formatPercentage(data.meritIncreasePercentage)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full"
              style={{ width: `${(data.meritIncreasePercentage / data.totalPercentage) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}