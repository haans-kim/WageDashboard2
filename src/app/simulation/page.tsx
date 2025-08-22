'use client'

import { useState, useMemo } from 'react'
import { useWageContext } from '@/context/WageContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import { GradeSalaryAdjustmentTable } from '@/components/dashboard/GradeSalaryAdjustmentTable'
import { IndustryComparisonSection } from '@/components/dashboard/IndustryComparisonSection'

export default function SimulationPage() {
  const { data, loading, error } = useDashboardData()
  const { 
    baseUpRate: contextBaseUpRate, 
    meritRate: contextMeritRate,
    setBaseUpRate: setContextBaseUpRate,
    setMeritRate: setContextMeritRate,
    detailedLevelRates: contextDetailedLevelRates,
    setDetailedLevelRates: setContextDetailedLevelRates,
  } = useWageContext()
  
  // Context의 값을 직접 사용
  const baseUpRate = contextBaseUpRate || 3.2
  const meritRate = contextMeritRate || 2.5
  const [enableAdditionalIncrease, setEnableAdditionalIncrease] = useState(false)
  const [meritWeightedAverage, setMeritWeightedAverage] = useState(0)
  
  // Context의 detailedLevelRates 사용 (시나리오 저장/불러오기와 연동)
  const detailedLevelRates = contextDetailedLevelRates || {
    'Lv.4': { baseUp: 3.2, merit: 2.5, promotion: 0, advancement: 0, additional: 0 },
    'Lv.3': { baseUp: 3.2, merit: 2.5, promotion: 0, advancement: 0, additional: 0 },
    'Lv.2': { baseUp: 3.2, merit: 2.5, promotion: 0, advancement: 0, additional: 0 },
    'Lv.1': { baseUp: 3.2, merit: 2.5, promotion: 0, advancement: 0, additional: 0 }
  }
  
  // 직급별 총 인상률 및 가중평균 상태
  const [levelTotalRates, setLevelTotalRates] = useState<{[key: string]: number}>({
    'Lv.1': 5.7,
    'Lv.2': 5.7,
    'Lv.3': 5.7,
    'Lv.4': 5.7
  })
  const [weightedAverageRate, setWeightedAverageRate] = useState(5.7)
  const [calculatedAdditionalBudget, setCalculatedAdditionalBudget] = useState(0)
  
  // GradeSalaryAdjustmentTable용 직원 데이터
  const employeeDataForTable = useMemo(() => {
    if (!data?.levelStatistics) return undefined
    
    return {
      totalCount: data.summary.totalEmployees,
      levels: data.levelStatistics.reduce((acc, level) => ({
        ...acc,
        [level.level]: {
          headcount: level.employeeCount,
          averageSalary: parseInt(level.averageSalary)
        }
      }), {})
    }
  }, [data])
  
  const updateLevelRate = (level: string, rates: any) => {
    console.log(`Level ${level} rates updated:`, rates)
    if (rates) {
      // Context의 setDetailedLevelRates 사용
      setContextDetailedLevelRates(prev => ({
        ...prev,
        [level]: rates
      }))
      
      // baseUpRate와 meritRate 업데이트 (전체 평균)
      const allLevelRates = {
        ...detailedLevelRates,
        [level]: rates
      }
      
      const levels = Object.keys(allLevelRates)
      const avgBaseUp = levels.reduce((sum, lv) => sum + allLevelRates[lv].baseUp, 0) / levels.length
      const avgMerit = levels.reduce((sum, lv) => sum + allLevelRates[lv].merit, 0) / levels.length
      
      setContextBaseUpRate(avgBaseUp)
      setContextMeritRate(avgMerit)
    }
  }
  
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow h-96"></div>
          </div>
        </div>
      </main>
    )
  }
  
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-3">
        {/* C사 대비 비교 */}
        <div className="mb-2">
          <IndustryComparisonSection
            baseUpRate={baseUpRate}
            meritRate={meritRate}
            levelTotalRates={levelTotalRates}
            weightedAverageRate={weightedAverageRate}
            levelStatistics={data?.levelStatistics || []}
            competitorData={data?.competitorData}
            competitorIncreaseRate={data?.industryComparison?.competitor || 0}
          />
        </div>
        
        {/* 직급별 고정급 인상률 조정 테이블 */}
        <div className="mb-2">
          <GradeSalaryAdjustmentTable
            baseUpRate={baseUpRate}
            meritRate={meritRate}
            initialRates={detailedLevelRates}
            employeeData={employeeDataForTable}
            enableAdditionalIncrease={enableAdditionalIncrease}
            onEnableAdditionalIncreaseChange={setEnableAdditionalIncrease}
            onRateChange={updateLevelRate}
            onTotalBudgetChange={(totalBudget) => {
              console.log('Total budget changed:', totalBudget)
            }}
            onAdditionalBudgetChange={(budget) => {
              console.log('Additional budget:', budget)
              setCalculatedAdditionalBudget(budget)
            }}
            onTotalRatesChange={(rates, average) => {
              setLevelTotalRates(rates)
              setWeightedAverageRate(average)
            }}
            onMeritWeightedAverageChange={setMeritWeightedAverage}
            onTotalSummaryChange={(summary) => {
              // 시뮬레이션 페이지에서는 Context 업데이트 없음
              console.log('Summary:', summary)
            }}
          />
        </div>
      </div>
    </main>
  )
}