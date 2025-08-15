'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PayBandCard } from '@/components/band/PayBandCard'
import { SimpleExportButton } from '@/components/ExportButton'
import { PayBandCompetitivenessHeatmap } from '@/components/analytics/PayBandCompetitivenessHeatmap'
import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'
import { useMetadata } from '@/hooks/useMetadata'
import { useBandData } from '@/hooks/useBandData'
import { BandName } from '@/types/band'
import { RateInfoCard } from '@/components/common/RateInfoCard'
import { useWageContext } from '@/context/WageContext'
import { loadExcelData } from '@/lib/clientStorage'

interface BandData {
  id: string
  name: BandName
  totalHeadcount: number
  avgBaseUpRate: number
  avgSBLIndex: number
  avgCAIndex: number
  totalBudgetImpact: number
  levels: Array<{
    level: string
    headcount: number
    meanBasePay: number
    baseUpKRW: number
    baseUpRate: number
    sblIndex: number
    caIndex: number
    competitiveness: number
    market: {
      min: number
      q1: number
      median: number
      q3: number
      max: number
    }
    company: {
      median: number
      mean: number
      values: number[]
    }
    competitor: {
      median: number
    }
  }>
}

function BandDashboardContent() {
  const searchParams = useSearchParams()
  const { bands: availableBands, loading: metadataLoading } = useMetadata()
  const { bands: bandsFromHook, loading: bandsLoading } = useBandData()
  const { baseUpRate: contextBaseUp, meritRate: contextMerit } = useWageContext()
  const [bands, setBands] = useState<BandData[]>([])
  const [loading, setLoading] = useState(true)
  const [fiscalYear] = useState(2025)
  const [bandBudgetImpacts, setBandBudgetImpacts] = useState<{ [key: string]: number }>({})
  const [selectedBand, setSelectedBand] = useState<string | null>(null)
  const [aiSettings, setAiSettings] = useState<any>(null)
  
  // 직군별 인상률 상태 관리 (경쟁력 분석용) - localStorage에서 초기값 로드
  const [bandRates, setBandRates] = useState<Record<string, {
    baseUpRate: number
    additionalRate: number
    meritMultipliers: Record<string, number>
  }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bandRates')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  
  // 엑셀 데이터에서 AI 설정 로드
  useEffect(() => {
    async function loadAiSettings() {
      const data = await loadExcelData()
      if (data?.aiSettings) {
        setAiSettings(data.aiSettings)
      }
    }
    loadAiSettings()
  }, [])
  
  // 인상률 우선순위: 1. WageContext (사용자가 조정한 값), 2. URL 파라미터, 3. AI 설정, 4. 기본값
  const initialBaseUp = contextBaseUp || parseFloat(searchParams.get('baseUp') || '') || aiSettings?.baseUpPercentage || 3.2
  const initialMerit = contextMerit || parseFloat(searchParams.get('merit') || '') || aiSettings?.meritIncreasePercentage || 2.5
  
  // fiscalYear 변경 시 처리 (현재는 사용하지 않음)
  useEffect(() => {
    // 클라이언트 데이터를 사용하므로 별도 fetch 불필요
  }, [fiscalYear])
  
  // bandRates가 변경될 때 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(bandRates).length > 0) {
      localStorage.setItem('bandRates', JSON.stringify(bandRates))
    }
  }, [bandRates])
  
  // 첫 번째 직군을 기본 선택 (전체가 기본)
  useEffect(() => {
    if (bands.length > 0 && selectedBand === null) {
      setSelectedBand('all') // 전체를 기본값으로 설정
    }
  }, [bands, selectedBand])
  
  // 선택된 직군 데이터
  const selectedBandData = bands.find(band => band.id === selectedBand)

  // 훅에서 가져온 데이터 사용
  useEffect(() => {
    if (!bandsLoading && bandsFromHook) {
      setBands(bandsFromHook)
      setLoading(false)
    }
  }, [bandsFromHook, bandsLoading])


  // 요약 계산 - 업데이트된 예산 영향 포함
  const summary = {
    totalHeadcount: bands.reduce((sum, band) => sum + (band?.totalHeadcount || 0), 0),
    totalBudgetImpact: Object.keys(bandBudgetImpacts).length > 0 
      ? Object.values(bandBudgetImpacts).reduce((sum, impact) => sum + impact, 0)
      : bands.reduce((sum, band) => sum + (band?.totalBudgetImpact || 0), 0),
    avgBaseUpRate: bands.length > 0 
      ? bands.reduce((sum, band) => sum + (band?.avgBaseUpRate || 0) * (band?.totalHeadcount || 0), 0) / 
        (bands.reduce((sum, band) => sum + (band?.totalHeadcount || 0), 0) || 1)
      : 0,
    avgSBLIndex: bands.length > 0
      ? bands.reduce((sum, band) => sum + (band?.avgSBLIndex || 0) * (band?.totalHeadcount || 0), 0) / 
        (bands.reduce((sum, band) => sum + (band?.totalHeadcount || 0), 0) || 1)
      : 0,
    avgCAIndex: bands.length > 0
      ? bands.reduce((sum, band) => sum + (band?.avgCAIndex || 0) * (band?.totalHeadcount || 0), 0) / 
        (bands.reduce((sum, band) => sum + (band?.totalHeadcount || 0), 0) || 1)
      : 0
  }
  
  // 전체 직급별 데이터 집계
  const totalBandData = {
    id: 'total',
    name: '전체' as BandName,
    totalHeadcount: summary.totalHeadcount,
    avgBaseUpRate: summary.avgBaseUpRate,
    avgSBLIndex: summary.avgSBLIndex,
    avgCAIndex: summary.avgCAIndex,
    totalBudgetImpact: summary.totalBudgetImpact,
    levels: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'].map(level => {
      const levelData = bands.flatMap(band => 
        band.levels ? band.levels.filter(l => l && l.level === level) : []
      ).filter(l => l !== undefined && l !== null)
      
      const totalHeadcount = levelData.reduce((sum, l) => sum + (l?.headcount || 0), 0)
      const totalBasePay = levelData.reduce((sum, l) => sum + ((l?.meanBasePay || 0) * (l?.headcount || 0)), 0)
      
      return {
        level,
        headcount: totalHeadcount,
        meanBasePay: totalHeadcount > 0 ? totalBasePay / totalHeadcount : 0,
        baseUpKRW: levelData.reduce((sum, l) => sum + (l?.baseUpKRW || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
        baseUpRate: levelData.reduce((sum, l) => sum + (l?.baseUpRate || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
        sblIndex: levelData.reduce((sum, l) => sum + (l?.sblIndex || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
        caIndex: levelData.reduce((sum, l) => sum + (l?.caIndex || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
        competitiveness: levelData.reduce((sum, l) => sum + (l?.competitiveness || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
        market: {
          min: levelData.length > 0 ? Math.min(...levelData.map(l => l?.market?.min || 0)) : 0,
          q1: levelData.reduce((sum, l) => sum + (l?.market?.q1 || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
          median: levelData.reduce((sum, l) => sum + (l?.market?.median || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
          q3: levelData.reduce((sum, l) => sum + (l?.market?.q3 || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
          max: levelData.length > 0 ? Math.max(...levelData.map(l => l?.market?.max || 0)) : 0
        },
        company: {
          median: levelData.reduce((sum, l) => sum + (l?.company?.median || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
          mean: levelData.reduce((sum, l) => sum + (l?.company?.mean || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1),
          values: levelData.flatMap(l => l?.company?.values || [])
        },
        competitor: {
          median: levelData.reduce((sum, l) => sum + (l?.competitor?.median || 0) * (l?.headcount || 0), 0) / (totalHeadcount || 1)
        }
      }
    })
  }

  if (loading || metadataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* 네비게이션 바 아래에 버튼 영역 추가 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center h-12 gap-2">
            <SimpleExportButton 
              isNavigation={true}
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">

        {/* 대시보드 인상률 정보 카드 */}
        <div className="mb-6">
          <RateInfoCard />
        </div>

        {/* 직군 네비게이션 메뉴 + 선택된 직군 카드 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽: 직군 네비게이션 메뉴 */}
          <div className="w-full lg:w-80 bg-white rounded-lg shadow p-2 md:p-4 mb-4 lg:mb-0">
            <h2 className="text-xl font-bold text-gray-900 mb-4">직군별 분석</h2>
            <nav className="space-y-2">
              {/* 전체 보기 옵션 */}
              <button
                onClick={() => setSelectedBand('all')}
                className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 ${
                  selectedBand === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm md:text-base">전체</span>
                  <span className="text-sm md:text-base font-medium">
                    {summary.totalHeadcount.toLocaleString()}명
                  </span>
                </div>
              </button>
              
              {/* 구분선 */}
              <div className="border-t border-gray-200 my-3"></div>
              
              {/* 개별 직군들 */}
              {bands.map((band, index) => (
                <button
                  key={band.id}
                  onClick={() => setSelectedBand(band.id)}
                  className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 ${
                    selectedBand === band.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm md:text-base">{band.name}</span>
                    <span className="text-sm md:text-base font-medium">
                      {band.totalHeadcount.toLocaleString()}명
                    </span>
                  </div>
                </button>
              ))}
              
              {/* 구분선 */}
              <div className="border-t border-gray-200 my-3"></div>
              
              {/* 경쟁력 분석 버튼 */}
              <button
                onClick={() => setSelectedBand('competitiveness')}
                className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 ${
                  selectedBand === 'competitiveness'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-semibold text-sm md:text-base">경쟁력 분석</span>
                </div>
              </button>
            </nav>
          </div>
          
          {/* 오른쪽: 선택된 직군의 상세 카드 */}
          <div className="flex-1">
            {selectedBand === 'all' ? (
              // 전체 보기: 직급별로 집계된 통합 카드
              <PayBandCard
                key="total"
                bandId="total"
                bandName={totalBandData.name}
                levels={totalBandData.levels}
                initialBaseUp={initialBaseUp}
                initialMerit={initialMerit}
                onRateChange={(bandId, data) => {
                  // 전체 집계에서는 예산 영향 업데이트 처리 생략
                  console.log('Total band rate changed:', data)
                }}
              />
            ) : selectedBand === 'competitiveness' ? (
              // 경쟁력 분석 보기
              <PayBandCompetitivenessHeatmap 
                bandRates={bandRates}
                initialMerit={initialMerit}
                bands={bands}
              />
            ) : selectedBandData ? (
              // 개별 직군 보기
              <PayBandCard
                key={selectedBandData.id}
                bandId={selectedBandData.id}
                bandName={selectedBandData.name}
                levels={selectedBandData.levels}
                initialBaseUp={initialBaseUp}
                initialMerit={initialMerit}
                currentRates={bandRates[selectedBandData.name]}  // 저장된 인상률 전달
                onRateChange={(bandId, data) => {
                  // 인상률 변경 시 예산 영향 업데이트
                  setBandBudgetImpacts(prev => ({
                    ...prev,
                    [bandId]: data.budgetImpact || 0
                  }))
                  
                  // 직군별 인상률 상태 업데이트 (경쟁력 분석용)
                  setBandRates(prev => ({
                    ...prev,
                    [selectedBandData.name]: {
                      baseUpRate: data.baseUpRate || 0.032,
                      additionalRate: data.additionalRate || 0.01,
                      meritMultipliers: data.meritMultipliers || {
                        'Lv.1': 1.0,
                        'Lv.2': 1.0,
                        'Lv.3': 1.0,
                        'Lv.4': 1.0
                      }
                    }
                  }))
                }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">직군을 선택해주세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function BandDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <BandDashboardContent />
    </Suspense>
  )
}