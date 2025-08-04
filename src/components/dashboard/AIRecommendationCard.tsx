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
  baseUpRate?: number
  meritRate?: number
  onBaseUpChange?: (value: number) => void
  onMeritChange?: (value: number) => void
  onReset?: () => void
}

export function AIRecommendationCard({ 
  data, 
  totalEmployees, 
  baseUpRate, 
  meritRate,
  onBaseUpChange,
  onMeritChange,
  onReset
}: AIRecommendationCardProps) {
  // Use simulation values if provided, otherwise use data values
  const displayBaseUp = baseUpRate ?? data?.baseUpPercentage ?? 0
  const displayMerit = meritRate ?? data?.meritIncreasePercentage ?? 0
  const displayTotal = displayBaseUp + displayMerit

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">AI 제안 적정 인상률</h2>
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  const isSimulated = baseUpRate !== undefined || meritRate !== undefined
  const showControls = onBaseUpChange && onMeritChange

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {isSimulated ? '시뮬레이션 인상률' : 'AI 제안 적정 인상률'}
        </h2>
        {isSimulated && onReset && (
          <button
            onClick={onReset}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            초기값으로 리셋
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">총 인원</span>
          <span className="font-bold font-tabular text-gray-900 text-lg">{totalEmployees.toLocaleString('ko-KR')}명</span>
        </div>
        
        <div className={`${isSimulated ? 'bg-purple-50' : 'bg-blue-50'} rounded-lg p-4`}>
          <div className="text-center">
            <p className="text-sm text-gray-600">{isSimulated ? '시뮬레이션' : '최적'} 인상률</p>
            <p className={`text-3xl font-bold ${isSimulated ? 'text-purple-600' : 'text-blue-600'} font-tabular`}>
              {formatPercentage(displayTotal)}
            </p>
            {!isSimulated && (
              <p className="text-xs text-gray-500 mt-1">
                Range {formatPercentage(data.minRange)}~{formatPercentage(data.maxRange)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 font-medium">Base-up 인상률</span>
            <span className={`font-bold font-tabular text-lg ${showControls ? 'text-purple-600 bg-purple-50 px-3 py-1 rounded' : ''}`}>
              {formatPercentage(displayBaseUp)}
            </span>
          </div>
          {showControls ? (
            <>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={displayBaseUp}
                onChange={(e) => onBaseUpChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider slider-baseup"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>10%</span>
              </div>
            </>
          ) : (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${isSimulated ? 'bg-purple-400' : 'bg-blue-400'} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${(displayBaseUp / displayTotal) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 font-medium">Merit 인상률</span>
            <span className={`font-bold font-tabular text-lg ${showControls ? 'text-pink-600 bg-pink-50 px-3 py-1 rounded' : ''}`}>
              {formatPercentage(displayMerit)}
            </span>
          </div>
          {showControls ? (
            <>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={displayMerit}
                onChange={(e) => onMeritChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider slider-merit"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>10%</span>
              </div>
            </>
          ) : (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${isSimulated ? 'bg-pink-400' : 'bg-green-400'} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${(displayMerit / displayTotal) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}