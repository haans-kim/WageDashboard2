'use client'

import { useState } from 'react'
import { SimulationResults } from '@/components/simulation/SimulationResults'
import { SimpleExportButton } from '@/components/ExportButton'

export default function SimulationPage() {
  const [baseUp, setBaseUp] = useState(3.2)
  const [merit, setMerit] = useState(2.5)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const levels = ['', 'Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
  const departments = ['', '영업1팀', '영업2팀', '개발팀', '인사팀', '재무팀', '마케팅팀']
  const ratings = ['', 'S', 'A', 'B']

  const runSimulation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUpPercentage: baseUp,
          meritIncreasePercentage: merit,
          filters: {
            ...(selectedLevel && { level: selectedLevel }),
            ...(selectedDepartment && { department: selectedDepartment }),
            ...(selectedRating && { performanceRating: selectedRating }),
          },
        }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Simulation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyToAll = async () => {
    if (!results) return

    setLoading(true)
    try {
      const response = await fetch('/api/simulation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: results.employees,
          applyToAll: true,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message)
        setShowConfirmDialog(false)
        setResults(null)
      }
    } catch (error) {
      console.error('Apply failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">임금 인상 시뮬레이션</h1>
          <p className="text-gray-600 mt-2">전체 직원 대상 임금 인상 시뮬레이션 및 일괄 적용</p>
        </header>

        {/* 시뮬레이션 설정 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">시뮬레이션 설정</h2>
          
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
              <h3 className="text-lg font-medium mb-3">필터 설정 (선택사항)</h3>
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
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level || '전체'}
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
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept || '전체'}
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
                    {ratings.map(rating => (
                      <option key={rating} value={rating}>
                        {rating || '전체'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
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
              <SimpleExportButton type="simulation" />
              <div className="flex gap-4">
                <button
                  onClick={() => setResults(null)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  결과 초기화
                </button>
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  전체 적용
                </button>
              </div>
            </div>
          </>
        )}

        {/* 확인 다이얼로그 */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">전체 적용 확인</h3>
              <p className="text-gray-600 mb-4">
                {results?.simulation.employeeCount}명의 직원에게 총 {(baseUp + merit).toFixed(1)}%의 
                인상률을 적용하시겠습니까?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                이 작업은 되돌릴 수 없습니다. 모든 직원의 급여가 업데이트되며 급여 이력에 기록됩니다.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={applyToAll}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? '적용 중...' : '확인'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}