'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PayBandCard } from '@/components/band/PayBandCard'
import { formatKoreanCurrency, formatPercentage } from '@/lib/utils'
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

export default function BandDashboard() {
  const searchParams = useSearchParams()
  const [bands, setBands] = useState<BandData[]>([])
  const [loading, setLoading] = useState(true)
  const [fiscalYear] = useState(2025)
  
  // 메인 대시보드에서 전달받은 인상률
  const initialBaseUp = parseFloat(searchParams.get('baseUp') || '3.2')
  const initialMerit = parseFloat(searchParams.get('merit') || '2.5')
  
  // 데이터 로드
  useEffect(() => {
    fetchBandData()
  }, [fiscalYear])

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


  // 요약 계산
  const summary = {
    totalHeadcount: bands.reduce((sum, band) => sum + band.totalHeadcount, 0),
    totalBudgetImpact: bands.reduce((sum, band) => sum + band.totalBudgetImpact, 0),
    avgBaseUpRate: bands.length > 0 
      ? bands.reduce((sum, band) => sum + band.avgBaseUpRate * band.totalHeadcount, 0) / 
        bands.reduce((sum, band) => sum + band.totalHeadcount, 0)
      : 0,
    avgSBLIndex: bands.length > 0
      ? bands.reduce((sum, band) => sum + band.avgSBLIndex * band.totalHeadcount, 0) / 
        bands.reduce((sum, band) => sum + band.totalHeadcount, 0)
      : 0
  }

  if (loading) {
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
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pay Band 분석 대시보드</h1>
              <p className="text-gray-600 mt-2">직군별 C사 대비 보상경쟁력 분석 및 인상률 조정</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                메인 대시보드
              </button>
              <button
                onClick={fetchBandData}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                새로고침
              </button>
            </div>
          </div>
        </header>

        {/* 상단 요약 패널 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-5 gap-6">
            <div>
              <p className="text-sm text-gray-600">회계연도</p>
              <p className="text-2xl font-bold text-gray-900">{fiscalYear}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 인원</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalHeadcount.toLocaleString()}명</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">기본 Base-up</p>
              <p className="text-2xl font-bold text-primary-600">{initialBaseUp}%</p>
              <p className="text-xs text-gray-500 mt-1">메인 대시보드 값</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">기본 Merit</p>
              <p className="text-2xl font-bold text-blue-600">{initialMerit}%</p>
              <p className="text-xs text-gray-500 mt-1">메인 대시보드 값</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">총 예산 영향</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatKoreanCurrency(summary.totalBudgetImpact, '억원', 100000000)}
              </p>
            </div>
          </div>
        </div>

        {/* 직군별 카드 리스트 */}
        <div className="space-y-6">
          {bands.map(band => (
            <PayBandCard
              key={band.id}
              bandId={band.id}
              bandName={band.name}
              levels={band.levels}
              initialBaseUp={initialBaseUp}
              initialMerit={initialMerit}
              onRateChange={(bandId, data) => {
                // 인상률 변경 시 처리 (필요한 경우)
                console.log(`Band ${bandId} rates changed:`, data)
              }}
            />
          ))}
        </div>
      </div>
    </main>
  )
}