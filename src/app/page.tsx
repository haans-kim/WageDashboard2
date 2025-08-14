'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useScenarios } from '@/hooks/useScenarios'
import { ScenarioManager } from '@/components/ScenarioManager'
import { AIRecommendationCard } from '@/components/dashboard/AIRecommendationCard'
import { BudgetResourceCard } from '@/components/dashboard/BudgetResourceCard'
import { BudgetUtilizationDetail } from '@/components/dashboard/BudgetUtilizationDetail'
import { GradeSalaryAdjustmentTable } from '@/components/dashboard/GradeSalaryAdjustmentTable'
import { IndustryComparisonSection } from '@/components/dashboard/IndustryComparisonSection'
import { ExportButton, SimpleExportButton } from '@/components/ExportButton'
import { ExcelUploadButton } from '@/components/ExcelUploadButton'
import { prepareExportData } from '@/lib/exportHelpers'

export default function Home() {
  const { data, loading, error, refresh } = useDashboardData()
  const [baseUpRate, setBaseUpRate] = useState(3.2) // 3.2% 고정
  const [meritRate, setMeritRate] = useState(2.5) // 2.5%로 설정 (3.2 + 2.5 = 5.7)
  const [totalBudget, setTotalBudget] = useState<number | null>(30000000000) // 총예산 300억원 유지
  
  // 개별 레벨 인상률 상태 - baseUp은 3.2, merit은 2.5로 초기화
  const [levelRates, setLevelRates] = useState({
    'Lv.1': { baseUp: 3.2, merit: 2.5 },
    'Lv.2': { baseUp: 3.2, merit: 2.5 },
    'Lv.3': { baseUp: 3.2, merit: 2.5 },
    'Lv.4': { baseUp: 3.2, merit: 2.5 }
  })
  
  // 예산활용내역 상세를 위한 상태 - 모두 0원으로 초기화
  const [promotionBudgets, setPromotionBudgets] = useState({
    lv2: 0,
    lv3: 0,
    lv4: 0
  })
  const [additionalBudget, setAdditionalBudget] = useState(0)
  const [enableAdditionalIncrease, setEnableAdditionalIncrease] = useState(false) // 비활성화로 시작
  
  // 계산된 예산 값들 상태
  const [budgetDetails, setBudgetDetails] = useState({
    aiRecommendation: 0,
    promotion: 0,
    additional: 0,
    indirect: 0
  })
  
  // 추가 인상 총액 상태 (GradeSalaryAdjustmentTable에서 계산)
  const [calculatedAdditionalBudget, setCalculatedAdditionalBudget] = useState(0)
  
  // 직급별 총 인상률 및 가중평균 상태 - 0으로 초기화
  const [levelTotalRates, setLevelTotalRates] = useState<{[key: string]: number}>({
    'Lv.1': 0,
    'Lv.2': 0,
    'Lv.3': 0,
    'Lv.4': 0
  })
  const [weightedAverageRate, setWeightedAverageRate] = useState(0)
  const [meritWeightedAverage, setMeritWeightedAverage] = useState(0) // 성과인상률 가중평균
  
  // GradeSalaryAdjustmentTable의 세부 인상률 상태 - baseUp 3.2%, 성과인상률 2.5%, 나머지는 0
  const [detailedLevelRates, setDetailedLevelRates] = useState<Record<string, {
    baseUp: number
    merit: number
    promotion: number
    advancement: number
    additional: number
  }>>({
    'Lv.4': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
    'Lv.3': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
    'Lv.2': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
    'Lv.1': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 }
  })
  
  // 시나리오 관리
  const {
    scenarios,
    activeScenarioId,
    saveScenario,
    loadScenario,
    deleteScenario,
    renameScenario
  } = useScenarios()
  
  // AI 설정 데이터가 로드되면 상태 동기화
  useEffect(() => {
    if (data?.aiRecommendation) {
      const aiData = data.aiRecommendation
      setBaseUpRate(aiData.baseUpPercentage)
      setMeritRate(aiData.meritIncreasePercentage)
      
      // 개별 레벨 인상률도 업데이트
      setLevelRates({
        'Lv.1': { baseUp: aiData.baseUpPercentage, merit: aiData.meritIncreasePercentage },
        'Lv.2': { baseUp: aiData.baseUpPercentage, merit: aiData.meritIncreasePercentage },
        'Lv.3': { baseUp: aiData.baseUpPercentage, merit: aiData.meritIncreasePercentage },
        'Lv.4': { baseUp: aiData.baseUpPercentage, merit: aiData.meritIncreasePercentage }
      })
      
      // 세부 인상률도 업데이트
      setDetailedLevelRates({
        'Lv.4': { baseUp: aiData.baseUpPercentage, merit: aiData.meritIncreasePercentage, promotion: 0, advancement: 0, additional: 0 },
        'Lv.3': { baseUp: aiData.baseUpPercentage, merit: aiData.meritIncreasePercentage, promotion: 0, advancement: 0, additional: 0 },
        'Lv.2': { baseUp: aiData.baseUpPercentage, merit: aiData.meritIncreasePercentage, promotion: 0, advancement: 0, additional: 0 },
        'Lv.1': { baseUp: aiData.baseUpPercentage, merit: aiData.meritIncreasePercentage, promotion: 0, advancement: 0, additional: 0 }
      })
    }
  }, [data?.aiRecommendation])
  
  // 새로운 인터페이스에 맞춰 수정
  const updateLevelRate = (level: string, rates: any) => {
    // 새로운 GradeSalaryAdjustmentTable에서 전체 rates 객체를 전달받음
    console.log(`Level ${level} rates updated:`, rates)
    // detailedLevelRates 업데이트
    if (rates) {
      setDetailedLevelRates(prev => ({
        ...prev,
        [level]: rates
      }))
    }
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
    // 실제 사용 예산 계산 (budgetDetails의 합계)
    const totalUsedBudget = budgetDetails.aiRecommendation + 
                           budgetDetails.promotion + 
                           budgetDetails.additional + 
                           budgetDetails.indirect
    
    saveScenario(name, {
      baseUpRate,
      meritRate,
      levelRates,
      totalBudget: totalUsedBudget || totalBudget || undefined, // 실제 사용 예산 저장
      
      // 예산활용내역 상세
      promotionBudgets,
      additionalBudget,
      enableAdditionalIncrease,
      calculatedAdditionalBudget,
      
      // 계산된 값들
      levelTotalRates,
      weightedAverageRate,
      meritWeightedAverage,
      
      // GradeSalaryAdjustmentTable의 세부 인상률
      detailedLevelRates
    })
  }
  
  // 시나리오 불러오기 핸들러
  const handleLoadScenario = (id: string) => {
    const scenarioData = loadScenario(id)
    if (scenarioData) {
      setBaseUpRate(scenarioData.baseUpRate)
      setMeritRate(scenarioData.meritRate)
      setLevelRates(scenarioData.levelRates as typeof levelRates)
      setTotalBudget(scenarioData.totalBudget || null)
      
      // 예산활용내역 상세 복원
      if (scenarioData.promotionBudgets) {
        setPromotionBudgets(scenarioData.promotionBudgets)
      }
      if (scenarioData.additionalBudget !== undefined) {
        setAdditionalBudget(scenarioData.additionalBudget)
      }
      if (scenarioData.enableAdditionalIncrease !== undefined) {
        setEnableAdditionalIncrease(scenarioData.enableAdditionalIncrease)
      }
      if (scenarioData.calculatedAdditionalBudget !== undefined) {
        setCalculatedAdditionalBudget(scenarioData.calculatedAdditionalBudget)
      }
      
      // 계산된 값들 복원
      if (scenarioData.levelTotalRates) {
        setLevelTotalRates(scenarioData.levelTotalRates)
      }
      if (scenarioData.weightedAverageRate !== undefined) {
        setWeightedAverageRate(scenarioData.weightedAverageRate)
      }
      if (scenarioData.meritWeightedAverage !== undefined) {
        setMeritWeightedAverage(scenarioData.meritWeightedAverage)
      }
      
      // GradeSalaryAdjustmentTable의 세부 인상률 복원
      if (scenarioData.detailedLevelRates) {
        setDetailedLevelRates(scenarioData.detailedLevelRates)
      }
    }
  }
  
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
  }, [data?.levelStatistics, data?.summary?.totalEmployees])
  
  // 내보내기용 데이터 준비
  const exportData = useMemo(() => {
    const currentState = {
      baseUpRate,
      meritRate,
      totalBudget,
      levelTotalRates,
      weightedAverageRate,
      meritWeightedAverage
    }
    
    // 현재 활성 시나리오 이름 가져오기
    const activeScenario = scenarios.find(s => s.id === activeScenarioId)
    const scenarioName = activeScenario?.name || '현재 설정'
    
    return prepareExportData(
      currentState,
      budgetDetails,
      data?.levelStatistics,
      detailedLevelRates,
      scenarioName
    )
  }, [
    baseUpRate,
    meritRate,
    totalBudget,
    levelTotalRates,
    weightedAverageRate,
    meritWeightedAverage,
    budgetDetails,
    detailedLevelRates,
    data?.levelStatistics,
    scenarios,
    activeScenarioId
  ])
  
  // 현재 시나리오 이름
  const currentScenarioName = useMemo(() => {
    const activeScenario = scenarios.find(s => s.id === activeScenarioId)
    return activeScenario?.name || '현재 설정'
  }, [scenarios, activeScenarioId])

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
      {/* 네비게이션 바 아래에 버튼 영역 추가 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center h-12 gap-2">
            <ExcelUploadButton 
              onUploadSuccess={refresh}
              isNavigation={true}
            />
            <ScenarioManager
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSave={handleSaveScenario}
              onLoad={handleLoadScenario}
              onDelete={deleteScenario}
              onRename={renameScenario}
              isNavigation={true}
            />
            <button
              onClick={() => {
                // API 데이터 새로고침
                refresh()
                // 사용자 조정 값들을 초기값으로 리셋
                setBaseUpRate(3.2)
                setMeritRate(2.5)
                setTotalBudget(30000000000)
                setLevelRates({
                  'Lv.1': { baseUp: 3.2, merit: 2.5 },
                  'Lv.2': { baseUp: 3.2, merit: 2.5 },
                  'Lv.3': { baseUp: 3.2, merit: 2.5 },
                  'Lv.4': { baseUp: 3.2, merit: 2.5 }
                })
                setPromotionBudgets({ lv2: 0, lv3: 0, lv4: 0 })
                setAdditionalBudget(0)
                setEnableAdditionalIncrease(false)
                setCalculatedAdditionalBudget(0)
                setLevelTotalRates({
                  'Lv.1': 0,
                  'Lv.2': 0,
                  'Lv.3': 0,
                  'Lv.4': 0
                })
                setWeightedAverageRate(0)
                setMeritWeightedAverage(0)
                setDetailedLevelRates({
                  'Lv.4': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
                  'Lv.3': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
                  'Lv.2': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 },
                  'Lv.1': { baseUp: 3.20, merit: 2.50, promotion: 0, advancement: 0, additional: 0 }
                })
              }}
              className="h-9 px-4 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              초기화
            </button>
            <SimpleExportButton 
              exportData={exportData}
              scenarioName={currentScenarioName}
              isNavigation={true}
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 py-4">
        
        {/* 상단 레이아웃: 좌측 2개 카드, 우측 예산활용내역상세 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-4 h-full">
            {/* AI 제안 적정인상률 */}
            <AIRecommendationCard 
              data={data?.aiRecommendation || null} 
              totalEmployees={data?.summary?.totalEmployees || 0}
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
              totalEmployees={data?.summary?.totalEmployees || 0}
              averageSalary={data?.summary?.averageSalary || 0}
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
            totalEmployees={data?.summary?.totalEmployees || 0}
            totalSalaryBase={data?.summary?.totalPayroll || 0}
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
            initialRates={detailedLevelRates}
            employeeData={employeeDataForTable}
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