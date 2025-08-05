'use client'

import { useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useScenarios } from '@/hooks/useScenarios'
import { ScenarioManager } from '@/components/ScenarioManager'
import { AIRecommendationCard } from '@/components/dashboard/AIRecommendationCard'
import { BudgetCard } from '@/components/dashboard/BudgetCard'
import { LevelDistributionCard } from '@/components/dashboard/LevelDistributionCard'
import { AIRecommendationDetailCard } from '@/components/dashboard/AIRecommendationDetailCard'
import { FixedSalaryRangeCard } from '@/components/dashboard/FixedSalaryRangeCard'
import { IndirectCostImpactCard } from '@/components/dashboard/IndirectCostImpactCard'
import { SimpleExportButton } from '@/components/ExportButton'

export default function Home() {
  const { data, loading, error, refresh } = useDashboardData()
  const [baseUpRate, setBaseUpRate] = useState(3.2)
  const [meritRate, setMeritRate] = useState(2.5)
  const [selectedFixedAmount, setSelectedFixedAmount] = useState(100) // 정액 인상 선택값 (만원/연)
  const [totalBudget, setTotalBudget] = useState<number | null>(null) // 총예산 (억원 단위)
  
  // 정액 인상 권장 범위 상태
  const [fixedSalaryRange, setFixedSalaryRange] = useState({
    minimum: 165,
    average: 168,
    maximum: 202
  })
  
  // 개별 레벨 인상률 상태
  const [levelRates, setLevelRates] = useState({
    'Lv.1': { baseUp: 3.2, merit: 2.5 },
    'Lv.2': { baseUp: 3.2, merit: 2.5 },
    'Lv.3': { baseUp: 3.2, merit: 2.5 },
    'Lv.4': { baseUp: 3.2, merit: 2.5 }
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
  
  const updateLevelRate = (level: string, type: 'baseUp' | 'merit', value: number) => {
    setLevelRates(prev => ({
      ...prev,
      [level]: {
        ...prev[level as keyof typeof prev],
        [type]: value
      }
    }))
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
      setLevelRates(scenarioData.levelRates)
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
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">인건비 대시보드</h1>
            <p className="text-gray-600 mt-2">실시간 인상률 조정 및 인건비 배분 최적화</p>
          </div>
          <div className="flex gap-3">
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
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIRecommendationCard 
            data={data?.aiRecommendation || null} 
            totalEmployees={data?.summary.totalEmployees || 0}
            baseUpRate={baseUpRate}
            meritRate={meritRate}
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
          <BudgetCard 
            data={data?.budget || null} 
            baseUpRate={baseUpRate}
            meritRate={meritRate}
            totalEmployees={data?.summary.totalEmployees || 0}
            averageSalary={data?.summary.averageSalary || 0}
            levelRates={levelRates}
            levelStatistics={data?.levelStatistics || []}
            selectedFixedAmount={selectedFixedAmount}
            customTotalBudget={totalBudget}
            onTotalBudgetChange={setTotalBudget}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LevelDistributionCard 
            data={data?.levelStatistics || []} 
            baseUpRate={baseUpRate}
            meritRate={meritRate}
            levelRates={levelRates}
            updateLevelRate={updateLevelRate}
          />
          
          <div className="space-y-6">
            <AIRecommendationDetailCard
              baseUpRate={baseUpRate}
              meritRate={meritRate}
              totalEmployees={data?.summary.totalEmployees || 0}
              averageSalary={data?.summary.averageSalary || 0}
              levelRates={levelRates}
              levelStatistics={data?.levelStatistics || []}
              totalBudget={totalBudget || (data?.budget ? Number(data.budget.totalBudget) / 100000000 : undefined)}
            />
            <FixedSalaryRangeCard
              baseUpRate={baseUpRate}
              meritRate={meritRate}
              selectedAmount={selectedFixedAmount}
              onAmountSelect={setSelectedFixedAmount}
              totalBudget={totalBudget || (data?.budget ? Number(data.budget.totalBudget) / 100000000 : undefined)}
              totalEmployees={data?.summary.totalEmployees || 0}
              fixedSalaryRange={fixedSalaryRange}
              onRangeChange={setFixedSalaryRange}
            />
            <IndirectCostImpactCard
              baseUpRate={baseUpRate}
              meritRate={meritRate}
              totalEmployees={data?.summary.totalEmployees || 0}
              averageSalary={data?.summary.averageSalary || 0}
              levelRates={levelRates}
              levelStatistics={data?.levelStatistics || []}
              totalBudget={totalBudget || (data?.budget ? Number(data.budget.totalBudget) / 100000000 : undefined)}
            />
          </div>
        </div>



        <div className="mt-6 text-center text-xs text-gray-500">
          <p>마지막 업데이트: {data ? new Date(data.summary.lastUpdated).toLocaleString('ko-KR') : '-'}</p>
        </div>
      </div>
    </main>
  )
}