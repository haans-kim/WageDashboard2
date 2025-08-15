'use client'

import React from 'react'
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
  meritWeightedAverage?: number  // 성과인상률 가중평균
  onBaseUpChange?: (value: number) => void
  onMeritChange?: (value: number) => void
  onReset?: () => void
}

function AIRecommendationCardComponent({ 
  data, 
  totalEmployees = 4925, // 실제 인원 반영
  baseUpRate = 3.2, 
  meritRate = 2.5,
  meritWeightedAverage,
  onBaseUpChange,
  onMeritChange,
  onReset
}: AIRecommendationCardProps) {
  // 엑셀에서 가져온 AI 설정 데이터 사용 (fallback으로 기본값 사용)
  const displayBaseUp = data?.baseUpPercentage ?? 3.2
  const displayMerit = data?.meritIncreasePercentage ?? 2.5
  const displayTotal = data?.totalPercentage ?? 5.7

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 h-full flex flex-col">
      <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-4">
        AI 제안 적정 인상률
      </h2>
      
      {/* 중앙 상단: 총 인원 표시 */}
      <div className="text-center mb-4 md:mb-8 pb-4 md:pb-6 border-b">
        <span className="text-sm md:text-base text-gray-600">총 인원</span>
        <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1">
          {totalEmployees.toLocaleString('ko-KR')}명
        </p>
        <span className="text-xs md:text-sm text-gray-500">(2025.06.07 기준)</span>
      </div>
      
      {/* 좌측: 최적 인상률, 우측: Base-up과 성과인상률 */}
      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* 좌측: 최적 인상률 */}
        <div className="bg-blue-50 rounded-lg p-4 flex items-center">
          <div className="text-center w-full">
            <p className="text-lg font-semibold text-gray-700 mb-2">최적 인상률</p>
            <p className="text-5xl font-bold text-blue-600 font-tabular">
              {formatPercentage(displayTotal)}
            </p>
          </div>
        </div>
        
        {/* 우측: Base-up과 성과인상률 */}
        <div className="flex flex-col justify-between h-full">
          {/* Base-up */}
          <div className="bg-gray-50 rounded-lg p-4 flex-1 flex items-center">
            <div className="flex justify-between items-center w-full">
              <span className="text-lg text-gray-700 font-medium">Base-up</span>
              <span className="text-3xl font-bold text-purple-600 font-tabular">
                {formatPercentage(displayBaseUp)}
              </span>
            </div>
          </div>
          
          <div className="h-4"></div>
          
          {/* 성과인상률 */}
          <div className="bg-gray-50 rounded-lg p-4 flex-1 flex items-center">
            <div className="flex justify-between items-center w-full">
              <span className="text-lg text-gray-700 font-medium">성과인상률</span>
              <span className="text-3xl font-bold text-pink-600 font-tabular">
                {formatPercentage(displayMerit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const AIRecommendationCard = React.memo(AIRecommendationCardComponent)