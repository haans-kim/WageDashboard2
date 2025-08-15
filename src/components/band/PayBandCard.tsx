'use client'

import React, { useState, useEffect } from 'react'
import { PayBandLineChart } from './PayBandLineChart'
import { ComparisonTable } from './ComparisonTable'
import { RaiseSliderPanel } from './RaiseSliderPanel'

interface LevelData {
  level: string
  headcount: number
  meanBasePay: number
  baseUpKRW: number
  baseUpRate: number
  sblIndex: number
  caIndex: number
  company: {
    median: number
    mean: number
    values: number[]
  }
  competitor: {
    median: number
  }
}

interface PayBandCardProps {
  bandId: string
  bandName: string
  levels: LevelData[]
  initialBaseUp: number
  initialMerit: number
  levelRates?: {  // 대시보드에서 설정한 직급별 인상률
    [level: string]: {
      baseUp: number
      merit: number
    }
  }
  onRateChange?: (bandId: string, updatedData: any) => void
  currentRates?: {  // 현재 저장된 인상률 값
    baseUpRate?: number
    additionalRate?: number
    meritMultipliers?: Record<string, number>
  }
}

export function PayBandCard({
  bandId,
  bandName,
  levels,
  initialBaseUp,
  initialMerit,
  levelRates,
  onRateChange,
  currentRates
}: PayBandCardProps) {
  // 인상률 상태 관리 - currentRates가 있으면 사용, 없으면 초기값 사용
  const [baseUpRate, setBaseUpRate] = useState(
    currentRates?.baseUpRate ?? initialBaseUp / 100
  )
  const [additionalRate, setAdditionalRate] = useState(
    currentRates?.additionalRate ?? 0.01
  )
  const [meritMultipliers, setMeritMultipliers] = useState(
    currentRates?.meritMultipliers ?? {
      'Lv.1': 1.0,
      'Lv.2': 1.0,
      'Lv.3': 1.0,
      'Lv.4': 1.0
    }
  )

  // currentRates prop이 변경될 때 상태 업데이트
  useEffect(() => {
    if (currentRates) {
      if (currentRates.baseUpRate !== undefined) {
        setBaseUpRate(currentRates.baseUpRate)
      }
      if (currentRates.additionalRate !== undefined) {
        setAdditionalRate(currentRates.additionalRate)
      }
      if (currentRates.meritMultipliers) {
        setMeritMultipliers(currentRates.meritMultipliers)
      }
    }
  }, [currentRates])

  // 차트 데이터 준비 - 인상률 적용
  const chartData = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
    .map(levelName => {
      const level = levels.find(l => l.level === levelName)
      if (!level || (level.headcount === 0 && level.company.median === 0)) {
        return null
      }
      
      // 각 직급별로 인상률 적용 - levelRates가 있으면 우선 사용
      let totalRaiseRate
      if (levelRates && levelRates[level.level]) {
        // 대시보드에서 설정한 직급별 인상률 사용
        const levelRate = levelRates[level.level]
        totalRaiseRate = levelRate.baseUp / 100 + levelRate.merit / 100
      } else {
        // 기존 로직: Pay Band 내에서 설정한 인상률 사용
        totalRaiseRate = baseUpRate + additionalRate + 
          (initialMerit / 100) * meritMultipliers[level.level as keyof typeof meritMultipliers]
      }
      const adjustedSblMedian = level.company.median * (1 + totalRaiseRate)
      
      return {
        level: level.level,
        sblMedian: level.company.median,  // 현재 값
        sblMedianAdjusted: adjustedSblMedian,  // 조정 후 값
        caMedian: level.competitor.median
      }
    })
    .filter(item => item !== null)

  // 테이블 데이터 준비 - 인상률 적용
  const tableData = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
    .map(levelName => {
      const level = levels.find(l => l.level === levelName)
      if (!level || (level.headcount === 0 && level.company.median === 0)) {
        return null
      }
      
      // 각 직급별로 인상률 적용 - levelRates가 있으면 우선 사용
      let totalRaiseRate
      if (levelRates && levelRates[level.level]) {
        // 대시보드에서 설정한 직급별 인상률 사용
        const levelRate = levelRates[level.level]
        totalRaiseRate = levelRate.baseUp / 100 + levelRate.merit / 100
      } else {
        // 기존 로직: Pay Band 내에서 설정한 인상률 사용
        totalRaiseRate = baseUpRate + additionalRate + 
          (initialMerit / 100) * meritMultipliers[level.level as keyof typeof meritMultipliers]
      }
      const adjustedSblMedian = level.company.median * (1 + totalRaiseRate)
      
      return {
        level: level.level,
        caMedian: level.competitor.median,
        sblMedian: level.company.median,
        sblMedianAdjusted: adjustedSblMedian
      }
    })
    .filter(item => item !== null)

  // 예산 영향 계산
  const calculateBudgetImpact = () => {
    return levels.reduce((total, level) => {
      const baseUp = level.meanBasePay * baseUpRate
      const additional = level.meanBasePay * additionalRate
      const merit = level.meanBasePay * (initialMerit / 100) * meritMultipliers[level.level as keyof typeof meritMultipliers]
      return total + (baseUp + additional + merit) * level.headcount
    }, 0)
  }

  // 성과인상 배수 변경
  const handleMeritMultiplierChange = (level: string, value: number) => {
    setMeritMultipliers(prev => ({
      ...prev,
      [level]: value
    }))
  }
  
  // 인상률 초기화
  const handleReset = () => {
    const defaultBaseUp = initialBaseUp / 100
    const defaultAdditional = 0.01
    const defaultMerit = {
      'Lv.1': 1.0,
      'Lv.2': 1.0,
      'Lv.3': 1.0,
      'Lv.4': 1.0
    }
    
    setBaseUpRate(defaultBaseUp)
    setAdditionalRate(defaultAdditional)
    setMeritMultipliers(defaultMerit)
    
    // 상위 컴포넌트에 초기화 알림
    if (onRateChange) {
      onRateChange(bandId, {
        baseUpRate: defaultBaseUp,
        additionalRate: defaultAdditional,
        meritMultipliers: defaultMerit,
        budgetImpact: calculateBudgetImpact()
      })
    }
  }

  // 인상률 변경 시 상위 컴포넌트에 알림
  useEffect(() => {
    if (onRateChange) {
      onRateChange(bandId, {
        baseUpRate,
        additionalRate,
        meritMultipliers,
        budgetImpact: calculateBudgetImpact()
      })
    }
  }, [baseUpRate, additionalRate, meritMultipliers])

  // 초기 마운트 시에도 예산 영향 전달
  useEffect(() => {
    if (onRateChange) {
      onRateChange(bandId, {
        baseUpRate,
        additionalRate,
        meritMultipliers,
        budgetImpact: calculateBudgetImpact()
      })
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 md:p-6">
      {/* 헤더 */}
      <div className="mb-3 md:mb-4 pb-2 md:pb-3 border-b border-gray-200">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900">{bandName}</h3>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          총 {levels.reduce((sum, l) => sum + l.headcount, 0)}명
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* 좌측: 차트와 테이블 - 더 넓게 */}
        <div className="xl:col-span-8 space-y-4">
          {/* 꺾은선 차트 */}
          <div className="p-1 md:p-2 bg-gray-50 rounded-lg min-h-[280px] md:min-h-[450px]">
            <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-1 px-1 md:px-2 pt-1 md:pt-2">보상경쟁력 분석</h4>
            <PayBandLineChart 
              key={`chart-${baseUpRate}-${additionalRate}-${JSON.stringify(meritMultipliers)}`}
              data={chartData} 
              bandName={bandName} 
            />
          </div>

          {/* 비교 테이블 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-base font-semibold text-gray-700 mb-3">상세 비교</h4>
            <ComparisonTable 
              key={`table-${baseUpRate}-${additionalRate}-${JSON.stringify(meritMultipliers)}`}
              data={tableData} 
            />
          </div>
        </div>

        {/* 우측: 슬라이더 패널 - 더 좁게 */}
        <div className="xl:col-span-4">
          <div className="sticky top-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-semibold text-gray-700">인상률 조정</h4>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>초기값</span>
                </div>
              </button>
            </div>
            <RaiseSliderPanel
              bandId={bandId}
              baseUpRate={baseUpRate}
              additionalRate={additionalRate}
              meritMultipliers={meritMultipliers}
              onBaseUpChange={setBaseUpRate}
              onAdditionalChange={setAdditionalRate}
              onMeritMultiplierChange={handleMeritMultiplierChange}
              budgetImpact={calculateBudgetImpact()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}