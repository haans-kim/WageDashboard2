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
  onRateChange?: (bandId: string, updatedData: any) => void
}

export function PayBandCard({
  bandId,
  bandName,
  levels,
  initialBaseUp,
  initialMerit,
  onRateChange
}: PayBandCardProps) {
  // 인상률 상태 관리
  const [baseUpRate, setBaseUpRate] = useState(initialBaseUp / 100)
  const [additionalRate, setAdditionalRate] = useState(0.01) // 기본 1%
  const [meritMultipliers, setMeritMultipliers] = useState({
    'Lv.1': 1.0,
    'Lv.2': 1.0,
    'Lv.3': 1.0,
    'Lv.4': 1.0
  })

  // 차트 데이터 준비 - 인상률 적용
  const chartData = levels
    .filter(level => level.headcount > 0 || level.company.median > 0)
    .map(level => {
      // 각 직급별로 인상률 적용
      const totalRaiseRate = baseUpRate + additionalRate + 
        (initialMerit / 100) * meritMultipliers[level.level as keyof typeof meritMultipliers]
      const adjustedSblMedian = level.company.median * (1 + totalRaiseRate)
      
      return {
        level: level.level,
        sblMedian: level.company.median,  // 현재 값
        sblMedianAdjusted: adjustedSblMedian,  // 조정 후 값
        caMedian: level.competitor.median
      }
    })
    .sort((a, b) => {
      // Lv.1, Lv.2, Lv.3, Lv.4 순서로 정렬
      const levelOrder = { 'Lv.1': 1, 'Lv.2': 2, 'Lv.3': 3, 'Lv.4': 4 }
      return (levelOrder[a.level as keyof typeof levelOrder] || 0) - 
             (levelOrder[b.level as keyof typeof levelOrder] || 0)
    })

  // 테이블 데이터 준비 - 인상률 적용
  const tableData = levels
    .filter(level => level.headcount > 0 || level.company.median > 0)
    .map(level => {
      const totalRaiseRate = baseUpRate + additionalRate + 
        (initialMerit / 100) * meritMultipliers[level.level as keyof typeof meritMultipliers]
      const adjustedSblMedian = level.company.median * (1 + totalRaiseRate)
      
      return {
        level: level.level,
        caMedian: level.competitor.median,
        sblMedian: level.company.median,
        sblMedianAdjusted: adjustedSblMedian
      }
    })

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
    <div className="bg-white rounded-lg shadow-lg p-6">
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
          <div className="p-2 bg-gray-50 rounded-lg min-h-[450px]">
            <h4 className="text-base font-semibold text-gray-700 mb-1 px-2 pt-2">보상경쟁력 분석</h4>
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
            <h4 className="text-base font-semibold text-gray-700 mb-3">인상률 조정</h4>
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