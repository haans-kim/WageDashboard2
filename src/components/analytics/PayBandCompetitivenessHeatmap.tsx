'use client'

import { useState, useEffect } from 'react'
import { useBandData } from '@/hooks/useBandData'

interface LevelData {
  level: string
  headcount: number
  competitiveness: number
  sblIndex: number  // 우리회사 vs C사 경쟁력 (%)
  caIndex: number   // C사 평균 급여
  meanBasePay: number  // 우리회사 평균 급여
}

interface BandData {
  id: string
  name: string
  levels: LevelData[]
}

interface Props {
  bandRates?: Record<string, {
    baseUpRate: number
    additionalRate: number
    meritMultipliers: Record<string, number>
  }>
  initialMerit?: number
  bands?: BandData[]  // Accept bands as props
}

export function PayBandCompetitivenessHeatmap({ bandRates = {}, initialMerit = 2.5, bands: propsB = [] }: Props) {
  const { bands: hookBands, loading: hookLoading } = useBandData()
  const [bands, setBands] = useState<BandData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'AS-IS' | 'TO-BE'>('AS-IS')
  
  useEffect(() => {
    // Use props bands if provided, otherwise use hook bands
    if (propsB && propsB.length > 0) {
      setBands(propsB)
      setLoading(false)
    } else if (hookBands && hookBands.length > 0) {
      setBands(hookBands)
      setLoading(false)
    } else if (!hookLoading) {
      // If not loading and no data, set empty
      setBands([])
      setLoading(false)
    }
  }, [propsB, hookBands, hookLoading])
  
  // TO-BE 경쟁력 계산 함수
  const calculateToBECompetitiveness = (band: BandData, level: LevelData) => {
    const rate = bandRates[band.name]
    if (!rate || !level.meanBasePay) return level.sblIndex
    
    // 인상률 계산
    const meritMultiplier = rate.meritMultipliers[level.level] || 1.0
    const totalRate = rate.baseUpRate + rate.additionalRate + (initialMerit / 100) * meritMultiplier
    
    // 조정된 급여 계산
    const adjustedSalary = level.meanBasePay * (1 + totalRate)
    
    // 새로운 경쟁력 계산 (조정된 급여 / C사 급여 * 100)
    if (level.caIndex > 0) {
      return Math.round((adjustedSalary / level.caIndex) * 100)
    }
    return level.sblIndex
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
        const value = viewMode === 'TO-BE' 
          ? calculateToBECompetitiveness(band, level)
          : level.sblIndex  // 우리회사 vs C사 경쟁력
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
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              우리회사 vs C사 경쟁력 분석
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              각 직군×직급별 평균급여 비교 (우리회사/C사 × 100%)
            </p>
          </div>
          {/* AS-IS / TO-BE 토글 버튼 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('AS-IS')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'AS-IS'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              AS-IS (현재)
            </button>
            <button
              onClick={() => setViewMode('TO-BE')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'TO-BE'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              TO-BE (조정후)
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* TO-BE 모드 안내 메시지 */}
        {viewMode === 'TO-BE' && Object.keys(bandRates).length === 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 TO-BE 모드: 각 직군별 페이지에서 인상률을 조정하면 변경사항이 여기에 반영됩니다.
            </p>
          </div>
        )}
        
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
                      const value = viewMode === 'TO-BE'
                        ? calculateToBECompetitiveness(band, level)
                        : level.sblIndex  // 우리회사 vs C사 경쟁력
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
                          const value = levelData 
                            ? (viewMode === 'TO-BE' 
                                ? calculateToBECompetitiveness(band, levelData)
                                : levelData.sblIndex)
                            : 0  // 우리회사 vs C사 경쟁력
                          const headcount = levelData?.headcount || 0
                          
                          return (
                            <td key={levelName} className="p-1">
                              <div className={`rounded-lg p-3 text-center transition-all ${getCellColor(value)} ${
                                viewMode === 'TO-BE' && bandRates[band.name] && levelData ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                              }`}>
                                {headcount > 0 ? (
                                  <div>
                                    <div className="text-lg font-bold">
                                      {value}%
                                    </div>
                                    <div className="text-xs opacity-80 mt-1">
                                      {headcount}명
                                    </div>
                                    {/* TO-BE 모드에서 변화율 표시 */}
                                    {viewMode === 'TO-BE' && bandRates[band.name] && levelData && (
                                      <div className="text-xs opacity-90 mt-1">
                                        {levelData.sblIndex > 0 && value !== levelData.sblIndex && (
                                          <span className={value > levelData.sblIndex ? 'text-green-200' : 'text-red-200'}>
                                            ({value > levelData.sblIndex ? '+' : ''}{value - levelData.sblIndex}%)
                                          </span>
                                        )}
                                      </div>
                                    )}
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
                          const value = viewMode === 'TO-BE'
                            ? calculateToBECompetitiveness(band, levelData)
                            : levelData.sblIndex  // 우리회사 vs C사 경쟁력
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
          <div className="space-y-4 flex flex-col h-full">
            {/* 경쟁력 부족 */}
            <div className="bg-red-50 rounded-lg p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-red-900">경쟁력 부족 (&lt;95%)</h4>
                <span className="text-lg font-bold text-red-600">{summary.totalUnder}명</span>
              </div>
              <div className="space-y-1.5">
                {bands.map(band => {
                  const underLevels = band.levels
                    .filter(level => {
                      const value = viewMode === 'TO-BE'
                        ? calculateToBECompetitiveness(band, level)
                        : level.sblIndex
                      return level.headcount > 0 && value < 95
                    })
                    .map(level => level.level)
                  
                  if (underLevels.length === 0) return null
                  
                  return (
                    <div key={band.id} className="text-sm text-red-700">
                      <span className="font-semibold">{band.name}:</span> {underLevels.join(', ')}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* 적정 */}
            <div className="bg-green-50 rounded-lg p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-green-900">적정 (95-105%)</h4>
                <span className="text-lg font-bold text-green-600">{summary.totalFit}명</span>
              </div>
              <div className="space-y-1.5">
                {bands.map(band => {
                  const fitLevels = band.levels
                    .filter(level => {
                      const value = viewMode === 'TO-BE'
                        ? calculateToBECompetitiveness(band, level)
                        : level.sblIndex
                      return level.headcount > 0 && value >= 95 && value <= 105
                    })
                    .map(level => level.level)
                  
                  if (fitLevels.length === 0) return null
                  
                  return (
                    <div key={band.id} className="text-sm text-green-700">
                      <span className="font-semibold">{band.name}:</span> {fitLevels.join(', ')}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* 경쟁력 우위 */}
            <div className="bg-blue-50 rounded-lg p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-blue-900">경쟁력 우위 (&gt;105%)</h4>
                <span className="text-lg font-bold text-blue-600">{summary.totalOver}명</span>
              </div>
              <div className="space-y-1.5">
                {bands.map(band => {
                  const overLevels = band.levels
                    .filter(level => {
                      const value = viewMode === 'TO-BE'
                        ? calculateToBECompetitiveness(band, level)
                        : level.sblIndex
                      return level.headcount > 0 && value > 105
                    })
                    .map(level => level.level)
                  
                  if (overLevels.length === 0) return null
                  
                  return (
                    <div key={band.id} className="text-sm text-blue-700">
                      <span className="font-semibold">{band.name}:</span> {overLevels.join(', ')}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}