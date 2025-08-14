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
  totalEmployees?: number
  baseUpRate?: number
  meritRate?: number
  onBaseUpChange?: (value: number) => void
  onMeritChange?: (value: number) => void
  onReset?: () => void
}

export function AIRecommendationCard({ 
  data, 
  totalEmployees = 4925, // 실제 인원 반영
  baseUpRate = 3.2, 
  meritRate = 2.5,
  onBaseUpChange,
  onMeritChange,
  onReset
}: AIRecommendationCardProps) {
  // Use simulation values if provided, otherwise use default values
  const displayBaseUp = baseUpRate
  const displayMerit = meritRate
  const displayTotal = displayBaseUp + displayMerit

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        AI 제안 적정 인상률
      </h2>
      
      {/* 중앙 상단: 총 인원 표시 */}
      <div className="text-center mb-8 pb-6 border-b">
        <span className="text-base text-gray-600">총 인원</span>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {totalEmployees.toLocaleString('ko-KR')}명
        </p>
        <span className="text-sm text-gray-500">(2025.06.07 기준)</span>
      </div>
      
      {/* 좌측: 최적 인상률, 우측: Base-up과 성과인상률 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 좌측: 최적 인상률 */}
        <div className="bg-blue-50 rounded-lg p-4 flex items-center">
          <div className="text-center w-full">
            <p className="text-base font-medium text-gray-700 mb-2">최적 인상률</p>
            <p className="text-4xl font-bold text-blue-600 font-tabular">
              {formatPercentage(displayTotal)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Range: {formatPercentage(5.7)}~{formatPercentage(5.9)}
            </p>
          </div>
        </div>
        
        {/* 우측: Base-up과 성과인상률 */}
        <div className="flex flex-col justify-between h-full">
          {/* Base-up */}
          <div className="bg-gray-50 rounded-lg p-4 flex-1 flex items-center">
            <div className="flex justify-between items-center w-full">
              <span className="text-base text-gray-700 font-medium">Base-up</span>
              <span className="text-2xl font-bold text-purple-600 font-tabular">
                {formatPercentage(displayBaseUp)}
              </span>
            </div>
          </div>
          
          <div className="h-4"></div>
          
          {/* 성과인상률 */}
          <div className="bg-gray-50 rounded-lg p-4 flex-1 flex items-center">
            <div className="flex justify-between items-center w-full">
              <span className="text-base text-gray-700 font-medium">성과인상률</span>
              <span className="text-2xl font-bold text-pink-600 font-tabular">
                {formatPercentage(displayMerit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}