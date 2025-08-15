'use client'

import React, { useState, useEffect } from 'react'
import { PayBandLineChart } from './PayBandLineChart'
import { ComparisonTable } from './ComparisonTable'
import { RaiseSliderPanel } from './RaiseSliderPanel'
import { useWageContext } from '@/context/WageContext'

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
  const { setBandFinalRates, bandFinalRates } = useWageContext()
  
  // 직군별 조정값 관리 (0이 기본값)
  const [baseUpAdjustment, setBaseUpAdjustment] = useState(0)
  const [meritAdjustment, setMeritAdjustment] = useState(0)

  // localStorage에서 저장된 조정값 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined' && bandName) {
      const savedAdjustments = localStorage.getItem(`bandAdjustments_${bandName}`)
      if (savedAdjustments) {
        const parsed = JSON.parse(savedAdjustments)
        setBaseUpAdjustment(parsed.baseUpAdjustment || 0)
        setMeritAdjustment(parsed.meritAdjustment || 0)
      }
    }
  }, [bandName])

  // 조정값 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && bandName) {
      const adjustments = { baseUpAdjustment, meritAdjustment }
      localStorage.setItem(`bandAdjustments_${bandName}`, JSON.stringify(adjustments))
    }
  }, [bandName, baseUpAdjustment, meritAdjustment])

  // 최종 인상률 계산 및 Context 저장
  useEffect(() => {
    if (levelRates && bandName) {
      const finalRates: { [level: string]: { baseUp: number; merit: number } } = {}
      
      ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'].forEach(level => {
        finalRates[level] = {
          baseUp: (levelRates[level]?.baseUp || 0) + baseUpAdjustment,
          merit: (levelRates[level]?.merit || 0) + meritAdjustment
        }
      })
      
      // Context에 직군별 최종 인상률 저장
      setBandFinalRates(prev => ({
        ...prev,
        [bandName]: finalRates
      }))
    }
  }, [levelRates, bandName, baseUpAdjustment, meritAdjustment, setBandFinalRates])

  // 차트 데이터 준비 - 인상률 적용
  const chartData = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
    .map(levelName => {
      const level = levels.find(l => l.level === levelName)
      if (!level || (level.headcount === 0 && level.company.median === 0)) {
        return null
      }
      
      // 최종 인상률 계산 (대시보드 기준 + 직군 조정)
      let totalRaiseRate = 0
      if (levelRates && levelRates[level.level]) {
        const baseRate = levelRates[level.level]
        totalRaiseRate = (baseRate.baseUp + baseUpAdjustment) / 100 + 
                        (baseRate.merit + meritAdjustment) / 100
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
      
      // 최종 인상률 계산 (대시보드 기준 + 직군 조정)
      let totalRaiseRate = 0
      if (levelRates && levelRates[level.level]) {
        const baseRate = levelRates[level.level]
        totalRaiseRate = (baseRate.baseUp + baseUpAdjustment) / 100 + 
                        (baseRate.merit + meritAdjustment) / 100
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
      if (levelRates && levelRates[level.level]) {
        const baseRate = levelRates[level.level]
        const finalBaseUp = (baseRate.baseUp + baseUpAdjustment) / 100
        const finalMerit = (baseRate.merit + meritAdjustment) / 100
        const totalRate = finalBaseUp + finalMerit
        return total + (level.meanBasePay * totalRate * level.headcount)
      }
      return total
    }, 0)
  }

  // 인상률 초기화 (조정값만 0으로 리셋)
  const handleReset = () => {
    setBaseUpAdjustment(0)
    setMeritAdjustment(0)
    
    // localStorage에서도 삭제
    if (typeof window !== 'undefined' && bandName) {
      localStorage.removeItem(`bandAdjustments_${bandName}`)
    }
    
    // Context에서 해당 직군 조정값 제거
    if (bandName) {
      setBandFinalRates(prev => {
        const newRates = { ...prev }
        delete newRates[bandName]
        return newRates
      })
    }
  }

  // 조정값 변경 시 상위 컴포넌트에 알림
  useEffect(() => {
    if (onRateChange) {
      onRateChange(bandId, {
        baseUpAdjustment,
        meritAdjustment,
        budgetImpact: calculateBudgetImpact()
      })
    }
  }, [baseUpAdjustment, meritAdjustment])

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
              key={`chart-${baseUpAdjustment}-${meritAdjustment}`}
              data={chartData} 
              bandName={bandName} 
            />
          </div>

          {/* 비교 테이블 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-base font-semibold text-gray-700 mb-3">상세 비교</h4>
            <ComparisonTable 
              key={`table-${baseUpAdjustment}-${meritAdjustment}`}
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
              bandName={bandName}
              levelRates={levelRates}
              baseUpAdjustment={baseUpAdjustment}
              meritAdjustment={meritAdjustment}
              onBaseUpAdjustmentChange={setBaseUpAdjustment}
              onMeritAdjustmentChange={setMeritAdjustment}
              onReset={handleReset}
              budgetImpact={calculateBudgetImpact()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}