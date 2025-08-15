'use client'

import { useState, useEffect } from 'react'
import { useWageContext } from '@/context/WageContext'

interface Employee {
  id: string
  name: string
  level: string
  band: string
  currentSalary: number
  performanceRating?: string
}

interface BandData {
  band: string
  minSalary: number
  q1Salary: number
  medianSalary: number
  q3Salary: number
  maxSalary: number
}

export function PayBandCompetitivenessHeatmap() {
  const { calculateToBeSalary } = useWageContext()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [bands, setBands] = useState<BandData[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const [empResponse, bandResponse] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/bands')
      ])
      
      const empData = await empResponse.json()
      const bandData = await bandResponse.json()
      
      setEmployees(empData.employees || [])
      setBands(bandData.bands || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 경쟁력 상태 계산
  const getCompetitivenessStatus = (salary: number, band: BandData) => {
    if (salary < band.q1Salary) return 'under' // 경쟁력 부족
    if (salary > band.q3Salary) return 'over'  // 경쟁력 우위
    return 'fit' // 적정
  }
  
  // 직급별, 밴드별 경쟁력 집계
  const analyzeCompetitiveness = () => {
    const levels = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
    const analysis: any = {}
    const summary = { under: [], fit: [], over: [] } as any
    
    // 디버깅을 위한 로그
    console.log('Analyzing competitiveness:', { 
      employeesCount: employees.length, 
      bandsCount: bands.length 
    })
    
    levels.forEach(level => {
      analysis[level] = {}
      bands.forEach(band => {
        const levelBandEmployees = employees.filter(
          emp => emp.level === level && emp.band === band.band
        )
        
        if (levelBandEmployees.length > 0) {
          console.log(`Found ${levelBandEmployees.length} employees for ${level}/${band.band}`)
        }
        
        const statuses = levelBandEmployees.map(emp => {
          const toBeSalary = calculateToBeSalary(emp.currentSalary, emp.level, emp.performanceRating)
          const status = getCompetitivenessStatus(toBeSalary, band)
          
          // 요약 데이터에 추가
          if (status === 'under') {
            summary.under.push({ ...emp, toBeSalary, band: band.band })
          } else if (status === 'over') {
            summary.over.push({ ...emp, toBeSalary, band: band.band })
          } else {
            summary.fit.push({ ...emp, toBeSalary, band: band.band })
          }
          
          return status
        })
        
        const counts = {
          under: statuses.filter(s => s === 'under').length,
          fit: statuses.filter(s => s === 'fit').length,
          over: statuses.filter(s => s === 'over').length,
          total: levelBandEmployees.length
        }
        
        analysis[level][band.band] = counts
      })
    })
    
    console.log('Analysis result:', { analysis, summary })
    return { analysis, summary }
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
  
  const { analysis, summary } = analyzeCompetitiveness()
  const levels = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
  
  // 히트맵 색상 결정
  const getHeatmapColor = (counts: any) => {
    if (!counts || counts.total === 0) return 'bg-gray-50'
    
    const underRatio = counts.under / counts.total
    const overRatio = counts.over / counts.total
    
    if (underRatio > 0.5) return 'bg-red-100 border-red-200' // 부족 많음
    if (overRatio > 0.5) return 'bg-blue-100 border-blue-200' // 초과 많음
    if (counts.fit / counts.total > 0.5) return 'bg-green-100 border-green-200' // 적정 많음
    return 'bg-yellow-50 border-yellow-200' // 혼재
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">
          Pay Band 경쟁력 분석 (TO-BE 기준)
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 히트맵 */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-slate-600 pb-3">직급/직군</th>
                    {bands.map(band => (
                      <th key={band.band} className="text-center text-sm font-medium text-slate-600 pb-3 px-2">
                        {band.band}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {levels.map(level => (
                    <tr key={level}>
                      <td className="text-sm font-medium text-slate-700 py-2">{level}</td>
                      {bands.map(band => {
                        const counts = analysis[level][band.band]
                        return (
                          <td key={band.band} className="p-1">
                            <div className={`rounded-lg border p-3 text-center ${getHeatmapColor(counts)}`}>
                              {counts?.total > 0 ? (
                                <div>
                                  <div className="text-lg font-bold text-slate-900">{counts.total}</div>
                                  <div className="text-xs text-slate-600 mt-1">
                                    {counts.under > 0 && <span className="text-red-600">↓{counts.under} </span>}
                                    {counts.fit > 0 && <span className="text-green-600">●{counts.fit} </span>}
                                    {counts.over > 0 && <span className="text-blue-600">↑{counts.over}</span>}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-slate-400">-</div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 범례 */}
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                <span className="text-slate-600">경쟁력 부족 다수</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-slate-600">적정 다수</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                <span className="text-slate-600">경쟁력 우위 다수</span>
              </div>
            </div>
          </div>
          
          {/* 요약 정보 */}
          <div className="space-y-4">
            {/* 경쟁력 부족 */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-red-900">경쟁력 부족</h4>
                <span className="text-xl font-bold text-red-600">{summary.under.length}명</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {summary.under.slice(0, 5).map((emp: any, idx: number) => (
                  <div key={idx} className="text-xs text-red-700">
                    {emp.name} ({emp.level}/{emp.band})
                  </div>
                ))}
                {summary.under.length > 5 && (
                  <div className="text-xs text-red-600 font-medium">
                    외 {summary.under.length - 5}명...
                  </div>
                )}
              </div>
            </div>
            
            {/* 적정 */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-900">적정</h4>
                <span className="text-xl font-bold text-green-600">{summary.fit.length}명</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {summary.fit.slice(0, 5).map((emp: any, idx: number) => (
                  <div key={idx} className="text-xs text-green-700">
                    {emp.name} ({emp.level}/{emp.band})
                  </div>
                ))}
                {summary.fit.length > 5 && (
                  <div className="text-xs text-green-600 font-medium">
                    외 {summary.fit.length - 5}명...
                  </div>
                )}
              </div>
            </div>
            
            {/* 경쟁력 우위 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-blue-900">경쟁력 우위</h4>
                <span className="text-xl font-bold text-blue-600">{summary.over.length}명</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {summary.over.slice(0, 5).map((emp: any, idx: number) => (
                  <div key={idx} className="text-xs text-blue-700">
                    {emp.name} ({emp.level}/{emp.band})
                  </div>
                ))}
                {summary.over.length > 5 && (
                  <div className="text-xs text-blue-600 font-medium">
                    외 {summary.over.length - 5}명...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}