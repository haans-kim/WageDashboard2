'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useScenarios } from '@/hooks/useScenarios'
import { ScenarioManager } from '@/components/ScenarioManager'
import { AIRecommendationCard } from '@/components/dashboard/AIRecommendationCard'
import { BudgetResourceCard } from '@/components/dashboard/BudgetResourceCard'
import { BudgetUtilizationDetail } from '@/components/dashboard/BudgetUtilizationDetail'
import { GradeSalaryAdjustmentTable } from '@/components/dashboard/GradeSalaryAdjustmentTable'
import { IndustryComparisonSection } from '@/components/dashboard/IndustryComparisonSection'
import { SimpleExportButton } from '@/components/ExportButton'

export default function Home() {
  const { data, loading, error, refresh } = useDashboardData()
  const [baseUpRate, setBaseUpRate] = useState(3.2)
  const [meritRate, setMeritRate] = useState(2.5)
  const [totalBudget, setTotalBudget] = useState<number | null>(30000000000) // 총예산 300억원
  
  // 개별 레벨 인상률 상태
  const [levelRates, setLevelRates] = useState({
    'Lv.1': { baseUp: 3.2, merit: 2.5 },
    'Lv.2': { baseUp: 3.2, merit: 2.5 },
    'Lv.3': { baseUp: 3.2, merit: 2.5 },
    'Lv.4': { baseUp: 3.2, merit: 2.5 }
  })
  
  // 예산활용내역 상세를 위한 상태
  const [promotionBudgets, setPromotionBudgets] = useState({
    lv2: 263418542,
    lv3: 119262338,
    lv4: 32662484
  })
  const [additionalBudget, setAdditionalBudget] = useState(4499898100)
  const [enableAdditionalIncrease, setEnableAdditionalIncrease] = useState(true)
  
  // 계산된 예산 값들 상태
  const [budgetDetails, setBudgetDetails] = useState({
    aiRecommendation: 0,
    promotion: 0,
    additional: 0,
    indirect: 0
  })
  
  // 추가 인상 총액 상태 (GradeSalaryAdjustmentTable에서 계산)
  const [calculatedAdditionalBudget, setCalculatedAdditionalBudget] = useState(0)
  
  // 직급별 총 인상률 및 가중평균 상태
  const [levelTotalRates, setLevelTotalRates] = useState<{[key: string]: number}>({
    'Lv.1': 7.77,
    'Lv.2': 8.43,
    'Lv.3': 6.60,
    'Lv.4': 6.80
  })
  const [weightedAverageRate, setWeightedAverageRate] = useState(7.2)
  const [meritWeightedAverage, setMeritWeightedAverage] = useState(2.5) // 성과인상률 가중평균
  
  // 시나리오 관리
  const {
    scenarios,
    activeScenarioId,
    saveScenario,
    loadScenario,
    deleteScenario,
    renameScenario
  } = useScenarios()
  
  // 새로운 인터페이스에 맞춰 수정
  const updateLevelRate = (level: string, rates: any) => {
    // 새로운 GradeSalaryAdjustmentTable에서 전체 rates 객체를 전달받음
    console.log(`Level ${level} rates updated:`, rates)
    // 필요시 여기서 추가 처리 가능
  }
  
  // 승급/승격 예산 업데이트 핸들러
  const updatePromotionBudget = (level: string, value: number) => {
    setPromotionBudgets(prev => ({
      ...prev,
      [level]: value
    }))
  }
  
  // 추가 인상 예산 업데이트 핸들러
  const updateAdditionalBudget = (value: number) => {
    setAdditionalBudget(value)
  }
  
  // 시나리오 저장 핸들러
  const handleSaveScenario = (name: string) => {
    saveScenario(name, {
      baseUpRate,
      meritRate,
      selectedFixedAmount,
      levelRates,
      totalBudget: totalBudget || undefined,
      fixedSalaryRange
    })
  }
  
  // 시나리오 불러오기 핸들러
  const handleLoadScenario = (id: string) => {
    const scenarioData = loadScenario(id)
    if (scenarioData) {
      setBaseUpRate(scenarioData.baseUpRate)
      setMeritRate(scenarioData.meritRate)
      setSelectedFixedAmount(scenarioData.selectedFixedAmount)
      setLevelRates(scenarioData.levelRates as typeof levelRates)
      setTotalBudget(scenarioData.totalBudget || null)
      if (scenarioData.fixedSalaryRange) {
        setFixedSalaryRange(scenarioData.fixedSalaryRange)
      }
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow h-96"></div>
              <div className="bg-white rounded-lg shadow h-96"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
            <button 
              onClick={refresh}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-200">
      <div className="container mx-auto px-3 py-4">
        <header className="mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">인건비 대시보드</h1>
            <p className="text-sm text-gray-600 mt-1">실시간 인상률 조정 및 인건비 배분 최적화</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/bands?baseUp=${baseUpRate}&merit=${meritRate}`}
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Pay Band 분석
            </Link>
            <ScenarioManager
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSave={handleSaveScenario}
              onLoad={handleLoadScenario}
              onDelete={deleteScenario}
              onRename={renameScenario}
            />
            <SimpleExportButton type="summary" />
            <button
              onClick={refresh}
              className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </header>
        
        {/* 상단 레이아웃: 좌측 2개 카드, 우측 예산활용내역상세 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-4 h-full">
            {/* AI 제안 적정인상률 */}
            <AIRecommendationCard 
              data={data?.aiRecommendation || null} 
              totalEmployees={4925}
              baseUpRate={baseUpRate}
              meritRate={meritRate}
              meritWeightedAverage={meritWeightedAverage}
              onBaseUpChange={(value) => {
                setBaseUpRate(value)
                // 전체 슬라이더 변경 시 모든 레벨 업데이트
                setLevelRates({
                  'Lv.1': { baseUp: value, merit: levelRates['Lv.1'].merit },
                  'Lv.2': { baseUp: value, merit: levelRates['Lv.2'].merit },
                  'Lv.3': { baseUp: value, merit: levelRates['Lv.3'].merit },
                  'Lv.4': { baseUp: value, merit: levelRates['Lv.4'].merit }
                })
              }}
              onMeritChange={(value) => {
                setMeritRate(value)
                // 전체 슬라이더 변경 시 모든 레벨 업데이트
                setLevelRates({
                  'Lv.1': { ...levelRates['Lv.1'], merit: value },
                  'Lv.2': { ...levelRates['Lv.2'], merit: value },
                  'Lv.3': { ...levelRates['Lv.3'], merit: value },
                  'Lv.4': { ...levelRates['Lv.4'], merit: value }
                })
              }}
              onReset={() => {
                setBaseUpRate(3.2)
                setMeritRate(2.5)
                setLevelRates({
                  'Lv.1': { baseUp: 3.2, merit: 2.5 },
                  'Lv.2': { baseUp: 3.2, merit: 2.5 },
                  'Lv.3': { baseUp: 3.2, merit: 2.5 },
                  'Lv.4': { baseUp: 3.2, merit: 2.5 }
                })
              }}
            />
            
            {/* 인상재원예산현황 */}
            <BudgetResourceCard
              totalBudget={30000000000}
              baseUpRate={baseUpRate}
              meritRate={meritRate}
              totalEmployees={4925}
              averageSalary={57465000}
              levelRates={levelRates}
              levelStatistics={data?.levelStatistics || []}
              customTotalBudget={totalBudget}
              onTotalBudgetChange={setTotalBudget}
              budgetDetails={budgetDetails}
            />
          </div>
          
          {/* 예산활용내역상세 */}
          <BudgetUtilizationDetail
            baseUpRate={baseUpRate}
            meritRate={meritRate}
            meritWeightedAverage={meritWeightedAverage}
            totalEmployees={4925}
            totalSalaryBase={283034052564}
            totalBudget={totalBudget || 30000000000} // 원 단위 그대로 사용
            levelStatistics={data?.levelStatistics || []}
            promotionBudgets={promotionBudgets}
            onPromotionBudgetChange={updatePromotionBudget}
            additionalBudget={calculatedAdditionalBudget} // 자동 계산된 값 사용
            onAdditionalBudgetChange={updateAdditionalBudget}
            enableAdditionalIncrease={enableAdditionalIncrease}
            onEnableAdditionalIncreaseChange={setEnableAdditionalIncrease}
            onBudgetCalculated={setBudgetDetails}
          />
        </div>
        
        {/* 중앙: 직급별 고정급 인상률 조정 테이블 */}
        <div className="mb-4">
          <GradeSalaryAdjustmentTable
            baseUpRate={baseUpRate}
            meritRate={meritRate}
            onRateChange={updateLevelRate}
            onTotalBudgetChange={(totalBudget) => {
              console.log('Total budget changed:', totalBudget)
              // 필요시 다른 컴포넌트에 예산 정보 전달
            }}
            enableAdditionalIncrease={enableAdditionalIncrease}
            onAdditionalBudgetChange={setCalculatedAdditionalBudget}
            onLevelTotalRatesChange={(rates, avgRate) => {
              setLevelTotalRates(rates)
              setWeightedAverageRate(avgRate)
            }}
            onMeritWeightedAverageChange={setMeritWeightedAverage}
          />
        </div>
        
        {/* 하단: 동종업계 대비 비교 */}
        <div className="mb-4">
          <IndustryComparisonSection
            baseUpRate={baseUpRate}
            meritRate={meritRate}
            levelTotalRates={levelTotalRates}
            weightedAverageRate={weightedAverageRate}
          />
        </div>



        <div className="mt-3 text-center text-xs text-gray-500">
          <p>마지막 업데이트: {data ? new Date(data.summary.lastUpdated).toLocaleString('ko-KR') : '-'}</p>
        </div>
      </div>
    </main>
  )
}