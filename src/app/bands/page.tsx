'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PayBandCard } from '@/components/band/PayBandCard'
import { ExcelUploadButton } from '@/components/ExcelUploadButton'
import { SimpleExportButton } from '@/components/ExportButton'
import { PayBandCompetitivenessHeatmap } from '@/components/analytics/PayBandCompetitivenessHeatmap'
import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'
import { useMetadata } from '@/hooks/useMetadata'
import { BandName } from '@/types/band'

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
  const [bands, setBands] = useState<BandData[]>([])
  const [loading, setLoading] = useState(true)
  const [fiscalYear] = useState(2025)
  const [bandBudgetImpacts, setBandBudgetImpacts] = useState<{ [key: string]: number }>({})
  const [selectedBand, setSelectedBand] = useState<string | null>(null)
  
  // 메인 대시보드에서 전달받은 인상률
  const initialBaseUp = parseFloat(searchParams.get('baseUp') || '3.2')
  const initialMerit = parseFloat(searchParams.get('merit') || '2.5')
  
  // 데이터 로드
  useEffect(() => {
    fetchBandData()
  }, [fiscalYear])
  
  // 첫 번째 직군을 기본 선택 (전체가 기본)
  useEffect(() => {
    if (bands.length > 0 && selectedBand === null) {
      setSelectedBand('all') // 전체를 기본값으로 설정
    }
  }, [bands, selectedBand])
  
  // 선택된 직군 데이터
  const selectedBandData = bands.find(band => band.id === selectedBand)

  const fetchBandData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bands?fiscalYear=${fiscalYear}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API Response:', result) // 디버깅용
      
      if (result.success && result.data) {
        setBands(result.data.bands || [])
      } else {
        console.error('Invalid response format:', result)
        setBands([])
      }
    } catch (error) {
      console.error('Failed to fetch band data:', error)
      setBands([])
    } finally {
      setLoading(false)
    }
  }


  // 요약 계산 - 업데이트된 예산 영향 포함
  const summary = {
    totalHeadcount: bands.reduce((sum, band) => sum + band.totalHeadcount, 0),
    totalBudgetImpact: Object.keys(bandBudgetImpacts).length > 0 
      ? Object.values(bandBudgetImpacts).reduce((sum, impact) => sum + impact, 0)
      : bands.reduce((sum, band) => sum + band.totalBudgetImpact, 0),
    avgBaseUpRate: bands.length > 0 
      ? bands.reduce((sum, band) => sum + band.avgBaseUpRate * band.totalHeadcount, 0) / 
        bands.reduce((sum, band) => sum + band.totalHeadcount, 0)
      : 0,
    avgSBLIndex: bands.length > 0
      ? bands.reduce((sum, band) => sum + band.avgSBLIndex * band.totalHeadcount, 0) / 
        bands.reduce((sum, band) => sum + band.totalHeadcount, 0)
      : 0,
    avgCAIndex: bands.length > 0
      ? bands.reduce((sum, band) => sum + band.avgCAIndex * band.totalHeadcount, 0) / 
        bands.reduce((sum, band) => sum + band.totalHeadcount, 0)
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
        band.levels.filter(l => l.level === level)
      )
      
      const totalHeadcount = levelData.reduce((sum, l) => sum + l.headcount, 0)
      const totalBasePay = levelData.reduce((sum, l) => sum + l.meanBasePay * l.headcount, 0)
      
      return {
        level,
        headcount: totalHeadcount,
        meanBasePay: totalHeadcount > 0 ? totalBasePay / totalHeadcount : 0,
        baseUpKRW: levelData.reduce((sum, l) => sum + l.baseUpKRW * l.headcount, 0) / (totalHeadcount || 1),
        baseUpRate: levelData.reduce((sum, l) => sum + l.baseUpRate * l.headcount, 0) / (totalHeadcount || 1),
        sblIndex: levelData.reduce((sum, l) => sum + l.sblIndex * l.headcount, 0) / (totalHeadcount || 1),
        caIndex: levelData.reduce((sum, l) => sum + l.caIndex * l.headcount, 0) / (totalHeadcount || 1),
        competitiveness: levelData.reduce((sum, l) => sum + l.competitiveness * l.headcount, 0) / (totalHeadcount || 1),
        market: {
          min: Math.min(...levelData.map(l => l.market.min)),
          q1: levelData.reduce((sum, l) => sum + l.market.q1 * l.headcount, 0) / (totalHeadcount || 1),
          median: levelData.reduce((sum, l) => sum + l.market.median * l.headcount, 0) / (totalHeadcount || 1),
          q3: levelData.reduce((sum, l) => sum + l.market.q3 * l.headcount, 0) / (totalHeadcount || 1),
          max: Math.max(...levelData.map(l => l.market.max))
        },
        company: {
          median: levelData.reduce((sum, l) => sum + l.company.median * l.headcount, 0) / (totalHeadcount || 1),
          mean: levelData.reduce((sum, l) => sum + l.company.mean * l.headcount, 0) / (totalHeadcount || 1),
          values: levelData.flatMap(l => l.company.values)
        },
        competitor: {
          median: levelData.reduce((sum, l) => sum + l.competitor.median * l.headcount, 0) / (totalHeadcount || 1)
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
            <ExcelUploadButton 
              onUploadSuccess={() => {
                fetchBandData()
              }}
              isNavigation={true}
            />
            <SimpleExportButton 
              isNavigation={true}
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">

        {/* 상단 요약 패널 */}
        <div className="bg-white rounded-lg shadow p-3 md:p-6 mb-4 md:mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-6">
            <div>
              <p className="text-xs md:text-base text-gray-600">회계연도</p>
              <p className="text-base md:text-3xl font-bold text-gray-900">{fiscalYear}</p>
            </div>
            <div>
              <p className="text-xs md:text-base text-gray-600">총 인원</p>
              <p className="text-base md:text-3xl font-bold text-gray-900">{summary.totalHeadcount.toLocaleString()}명</p>
            </div>
            <div>
              <p className="text-xs md:text-base text-gray-600">기본 Base-up</p>
              <p className="text-base md:text-3xl font-bold text-primary-600">{initialBaseUp}%</p>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">메인 대시보드 값</p>
            </div>
            <div>
              <p className="text-xs md:text-base text-gray-600">기본 Merit</p>
              <p className="text-base md:text-3xl font-bold text-blue-600">{initialMerit}%</p>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">메인 대시보드 값</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-xs md:text-base text-gray-600">총 예산 영향</p>
              <p className="text-base md:text-3xl font-bold text-yellow-600">
                {formatKoreanCurrency(summary.totalBudgetImpact, '억원', 100000000)}
              </p>
            </div>
          </div>
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
            ) : selectedBandData ? (
              // 개별 직군 보기
              <PayBandCard
                key={selectedBandData.id}
                bandId={selectedBandData.id}
                bandName={selectedBandData.name}
                levels={selectedBandData.levels}
                initialBaseUp={initialBaseUp}
                initialMerit={initialMerit}
                onRateChange={(bandId, data) => {
                  // 인상률 변경 시 예산 영향 업데이트
                  setBandBudgetImpacts(prev => ({
                    ...prev,
                    [bandId]: data.budgetImpact || 0
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
        
        {/* Pay Band 경쟁력 분석 - 맨 아래 별도 섹션 */}
        <div className="mt-6">
          <PayBandCompetitivenessHeatmap />
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