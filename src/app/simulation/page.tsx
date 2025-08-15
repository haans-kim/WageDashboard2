'use client'

import { useState, useEffect } from 'react'
import { useWageContext } from '@/context/WageContext'
import { useMetadata } from '@/hooks/useMetadata'
import { useSimulationData } from '@/hooks/useSimulationData'
import { SimulationResults } from '@/components/simulation/SimulationResults'
import { SimpleExportButton } from '@/components/ExportButton'

export default function SimulationPage() {
  const { baseUpRate: globalBaseUp, meritRate: globalMerit } = useWageContext()
  const { departments, levels, ratings, loading: metadataLoading } = useMetadata()
  const { runSimulation: runSimulationHook, loading: simulationLoading } = useSimulationData()
  const [baseUp, setBaseUp] = useState(0)
  const [merit, setMerit] = useState(0)
  const [isIndependentMode, setIsIndependentMode] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  // Removed showConfirmDialog - not needed for client-side storage
  
  // 평가등급별 Merit 가중치
  const [performanceWeights, setPerformanceWeights] = useState({
    S: 1.5,
    A: 1.2,
    B: 1.0,
    C: 0.8
  })
  
  // 독립 모드가 아닐 때 대시보드 값과 동기화
  useEffect(() => {
    if (!isIndependentMode) {
      setBaseUp(globalBaseUp)
      setMerit(globalMerit)
    }
  }, [globalBaseUp, globalMerit, isIndependentMode])

  const runSimulation = async () => {
    setLoading(true)
    try {
      const data = await runSimulationHook({
        baseUpPercentage: baseUp,
        meritIncreasePercentage: merit,
        level: selectedLevel || undefined,
        department: selectedDepartment || undefined
      })
      
      setResults(data)
    } catch (error) {
      console.error('Simulation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // 메타데이터 로딩 중일 때 로딩 화면 표시
  if (metadataLoading) {
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 아래에 버튼 영역 추가 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center h-12 gap-2">
            <button
              onClick={() => {
                if (!isIndependentMode) {
                  setBaseUp(globalBaseUp)
                  setMerit(globalMerit)
                }
                setIsIndependentMode(!isIndependentMode)
              }}
              className={`h-8 md:h-9 px-2 md:px-4 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                isIndependentMode 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isIndependentMode ? '대시보드 값 동기화' : '독립 모드 시작'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

        {/* 시뮬레이션 설정 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">시뮬레이션 설정</h2>
            {!isIndependentMode && (
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">
                대시보드와 동기화 중
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-3">인상률 설정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base-up (%)
                  </label>
                  <input
                    type="number"
                    value={baseUp}
                    onChange={(e) => setBaseUp(parseFloat(e.target.value))}
                    step="0.1"
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merit increase (%)
                  </label>
                  <input
                    type="number"
                    value={merit}
                    onChange={(e) => setMerit(parseFloat(e.target.value))}
                    step="0.1"
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-gray-600">총 인상률</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {(baseUp + merit).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">시뮬레이션 대상 그룹</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    직급
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">전체</option>
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부서
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">전체</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성과 등급
                  </label>
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">전체</option>
                    {ratings.map(rating => (
                      <option key={rating} value={rating}>
                        {rating ? `${rating}등급` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* 평가등급별 Merit 가중치 설정 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">평가등급별 Merit 가중치 조정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['S', 'A', 'B', 'C'].map((grade) => (
                <div key={grade} className="bg-white p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{grade}등급</span>
                    <span className="text-sm font-bold text-primary-600">
                      {performanceWeights[grade as keyof typeof performanceWeights].toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={performanceWeights[grade as keyof typeof performanceWeights]}
                    onChange={(e) => setPerformanceWeights(prev => ({
                      ...prev,
                      [grade]: parseFloat(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={runSimulation}
              disabled={loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '계산 중...' : '시뮬레이션 실행'}
            </button>
          </div>
        </div>

        {/* 시뮬레이션 결과 */}
        {results && (
          <>
            <SimulationResults results={results} />
            
            <div className="mt-6 flex justify-between">
              <SimpleExportButton />
              <div className="flex gap-4">
                <button
                  onClick={() => setResults(null)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  결과 초기화
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  )
}