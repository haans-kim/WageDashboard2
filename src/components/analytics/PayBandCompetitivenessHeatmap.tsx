'use client'

import { useState, useEffect } from 'react'

interface LevelData {
  level: string
  headcount: number
  competitiveness: number
  sblIndex: number  // 우리회사 vs C사 경쟁력 (%)
  caIndex: number   // C사 평균 급여
}

interface BandData {
  id: string
  name: string
  levels: LevelData[]
}

export function PayBandCompetitivenessHeatmap() {
  const [bands, setBands] = useState<BandData[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/bands')
      const data = await response.json()
      
      if (data.success && data.data) {
        setBands(data.data.bands || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 색상 결정 함수
  const getCellColor = (value: number) => {
    if (!value || value === 0) return 'bg-gray-100 text-gray-400'
    
    if (value < 95) {
      // 경쟁력 부족 (빨간색)
      if (value < 85) return 'bg-red-600 text-white'
      if (value < 90) return 'bg-red-500 text-white'
      return 'bg-red-400 text-white'
    } else if (value >= 95 && value <= 105) {
      // 적정 (초록색)
      if (value >= 98 && value <= 102) return 'bg-green-500 text-white'
      return 'bg-green-400 text-white'
    } else {
      // 경쟁력 우위 (파란색)
      if (value > 115) return 'bg-blue-600 text-white'
      if (value > 110) return 'bg-blue-500 text-white'
      return 'bg-blue-400 text-white'
    }
  }
  
  // 요약 통계 계산
  const calculateSummary = () => {
    let totalUnder = 0
    let totalFit = 0
    let totalOver = 0
    let totalCount = 0
    
    bands.forEach(band => {
      band.levels.forEach(level => {
        const value = level.sblIndex  // 우리회사 vs C사 경쟁력
        if (level.headcount > 0) {
          totalCount += level.headcount
          if (value < 95) {
            totalUnder += level.headcount
          } else if (value >= 95 && value <= 105) {
            totalFit += level.headcount
          } else {
            totalOver += level.headcount
          }
        }
      })
    })
    
    return { totalUnder, totalFit, totalOver, totalCount }
  }
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }
  
  const levels = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1']
  const summary = calculateSummary()
  
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">
          우리회사 vs C사 경쟁력 분석
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          각 직군×직급별 평균급여 비교 (우리회사/C사 × 100%)
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 히트맵 */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-slate-600 pb-3 px-3">직군 / 직급</th>
                    {levels.map(level => (
                      <th key={level} className="text-center text-sm font-medium text-slate-600 pb-3 px-2 min-w-[80px]">
                        {level}
                      </th>
                    ))}
                    <th className="text-center text-sm font-medium text-slate-600 pb-3 px-2 min-w-[80px]">평균</th>
                  </tr>
                </thead>
                <tbody>
                  {bands.map((band, idx) => {
                    // 직군별 평균 계산
                    let totalValue = 0
                    let totalHeadcount = 0
                    band.levels.forEach(level => {
                      const value = level.sblIndex  // 우리회사 vs C사 경쟁력
                      if (level.headcount > 0) {
                        totalValue += value * level.headcount
                        totalHeadcount += level.headcount
                      }
                    })
                    const avgValue = totalHeadcount > 0 ? totalValue / totalHeadcount : 0
                    
                    return (
                      <tr key={band.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="text-sm font-medium text-slate-700 py-2 px-3">
                          {band.name}
                        </td>
                        {levels.map(levelName => {
                          const levelData = band.levels.find(l => l.level === levelName)
                          const value = levelData?.sblIndex || 0  // 우리회사 vs C사 경쟁력
                          const headcount = levelData?.headcount || 0
                          
                          return (
                            <td key={levelName} className="p-1">
                              <div className={`rounded-lg p-3 text-center transition-all ${getCellColor(value)}`}>
                                {headcount > 0 ? (
                                  <div>
                                    <div className="text-lg font-bold">
                                      {value}%
                                    </div>
                                    <div className="text-xs opacity-80 mt-1">
                                      {headcount}명
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm">-</div>
                                )}
                              </div>
                            </td>
                          )
                        })}
                        <td className="p-1">
                          <div className={`rounded-lg p-3 text-center ${getCellColor(avgValue)}`}>
                            <div className="text-lg font-bold">
                              {avgValue > 0 ? `${avgValue.toFixed(1)}%` : '-'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  
                  {/* 전체 평균 행 */}
                  <tr className="border-t-2 border-gray-300 bg-gray-100">
                    <td className="text-sm font-semibold text-slate-900 py-2 px-3">전체 평균</td>
                    {levels.map(levelName => {
                      let totalValue = 0
                      let totalHeadcount = 0
                      
                      bands.forEach(band => {
                        const levelData = band.levels.find(l => l.level === levelName)
                        if (levelData && levelData.headcount > 0) {
                          const value = levelData.sblIndex  // 우리회사 vs C사 경쟁력
                          totalValue += value * levelData.headcount
                          totalHeadcount += levelData.headcount
                        }
                      })
                      
                      const avgValue = totalHeadcount > 0 ? totalValue / totalHeadcount : 0
                      
                      return (
                        <td key={levelName} className="p-1">
                          <div className={`rounded-lg p-3 text-center ${getCellColor(avgValue)}`}>
                            <div className="text-lg font-bold">
                              {avgValue > 0 ? `${avgValue.toFixed(1)}%` : '-'}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                    <td className="p-1">
                      <div className="rounded-lg p-3 text-center bg-gray-200">
                        <div className="text-lg font-bold text-slate-900">
                          {(() => {
                            let totalValue = 0
                            let totalHeadcount = 0
                            
                            bands.forEach(band => {
                              band.levels.forEach(level => {
                                if (level.headcount > 0) {
                                  const value = level.sblIndex  // 우리회사 vs C사 경쟁력
                                  totalValue += value * level.headcount
                                  totalHeadcount += level.headcount
                                }
                              })
                            })
                            
                            const avg = totalHeadcount > 0 ? totalValue / totalHeadcount : 0
                            return avg > 0 ? `${avg.toFixed(1)}%` : '-'
                          })()}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* 범례 */}
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-slate-600">&lt;95% (경쟁력 부족)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-slate-600">95-105% (적정)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-slate-600">&gt;105% (경쟁력 우위)</span>
              </div>
            </div>
          </div>
          
          {/* 요약 정보 */}
          <div className="space-y-4">
            {/* 경쟁력 부족 */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-red-900">경쟁력 부족 (&lt;95%)</h4>
                <span className="text-xl font-bold text-red-600">{summary.totalUnder}명</span>
              </div>
              <div className="text-xs text-red-700">
                {summary.totalCount > 0 && (
                  <div>전체 인원의 {((summary.totalUnder / summary.totalCount) * 100).toFixed(1)}%</div>
                )}
              </div>
            </div>
            
            {/* 적정 */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-900">적정 (95-105%)</h4>
                <span className="text-xl font-bold text-green-600">{summary.totalFit}명</span>
              </div>
              <div className="text-xs text-green-700">
                {summary.totalCount > 0 && (
                  <div>전체 인원의 {((summary.totalFit / summary.totalCount) * 100).toFixed(1)}%</div>
                )}
              </div>
            </div>
            
            {/* 경쟁력 우위 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-blue-900">경쟁력 우위 (&gt;105%)</h4>
                <span className="text-xl font-bold text-blue-600">{summary.totalOver}명</span>
              </div>
              <div className="text-xs text-blue-700">
                {summary.totalCount > 0 && (
                  <div>전체 인원의 {((summary.totalOver / summary.totalCount) * 100).toFixed(1)}%</div>
                )}
              </div>
            </div>
            
            {/* 전체 통계 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">전체 분석 대상</h4>
              <div className="text-2xl font-bold text-gray-800">{summary.totalCount}명</div>
              <div className="text-xs text-gray-600 mt-1">
                {bands.length}개 직군 × {levels.length}개 직급
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}