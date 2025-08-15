import { useState } from 'react'
import { loadExcelData, hasStoredData } from '@/lib/clientStorage'

interface SimulationParams {
  baseUpPercentage: number
  meritIncreasePercentage: number
  level?: string
  department?: string
}

interface SimulationResult {
  simulation: {
    employeeCount: number
    currentTotal: number
    projectedTotal: number
    totalIncrease: number
    averageIncreasePercentage: number
  }
  distribution: Array<{
    range: string
    count: number
    percentage: number
  }>
  levelBreakdown: Array<{
    level: string
    employeeCount: number
    currentAverage: number
    projectedAverage: number
    increasePercentage: number
  }>
}

export function useSimulationData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSimulation = async (params: SimulationParams): Promise<SimulationResult | null> => {
    try {
      setLoading(true)
      setError(null)
      
      // 먼저 클라이언트 데이터 확인
      if (hasStoredData()) {
        const clientData = await loadExcelData()
        if (clientData) {
          let filtered = clientData.employees || []
          
          // 필터링
          if (params.level) {
            filtered = filtered.filter((emp: any) => emp.level === params.level)
          }
          
          if (params.department) {
            filtered = filtered.filter((emp: any) => emp.department === params.department)
          }
          
          // 시뮬레이션 계산
          const currentTotal = filtered.reduce((sum: number, emp: any) => sum + (emp.currentSalary || 0), 0)
          const increaseAmount = currentTotal * ((params.baseUpPercentage + params.meritIncreasePercentage) / 100)
          const projectedTotal = currentTotal + increaseAmount
          
          // 직급별 분석
          const levelMap = new Map()
          filtered.forEach((emp: any) => {
            if (!levelMap.has(emp.level)) {
              levelMap.set(emp.level, {
                employees: [],
                currentTotal: 0,
                count: 0
              })
            }
            const level = levelMap.get(emp.level)
            level.employees.push(emp)
            level.currentTotal += emp.currentSalary || 0
            level.count++
          })
          
          const levelBreakdown = Array.from(levelMap.entries()).map(([level, data]) => {
            const currentAverage = data.currentTotal / data.count
            const increaseRate = (params.baseUpPercentage + params.meritIncreasePercentage) / 100
            const projectedAverage = currentAverage * (1 + increaseRate)
            
            return {
              level,
              employeeCount: data.count,
              currentAverage: Math.round(currentAverage),
              projectedAverage: Math.round(projectedAverage),
              increasePercentage: params.baseUpPercentage + params.meritIncreasePercentage
            }
          })
          
          // 인상액 분포
          const ranges = [
            { min: 0, max: 1000000, label: '~100만원' },
            { min: 1000000, max: 2000000, label: '100~200만원' },
            { min: 2000000, max: 3000000, label: '200~300만원' },
            { min: 3000000, max: 4000000, label: '300~400만원' },
            { min: 4000000, max: 5000000, label: '400~500만원' },
            { min: 5000000, max: Infinity, label: '500만원 이상' }
          ]
          
          const distribution = ranges.map(range => {
            const count = filtered.filter((emp: any) => {
              const increase = (emp.currentSalary || 0) * ((params.baseUpPercentage + params.meritIncreasePercentage) / 100)
              return increase >= range.min && increase < range.max
            }).length
            
            return {
              range: range.label,
              count,
              percentage: filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0
            }
          }).filter(item => item.count > 0)
          
          const result: SimulationResult = {
            simulation: {
              employeeCount: filtered.length,
              currentTotal,
              projectedTotal: Math.round(projectedTotal),
              totalIncrease: Math.round(increaseAmount),
              averageIncreasePercentage: params.baseUpPercentage + params.meritIncreasePercentage
            },
            distribution,
            levelBreakdown
          }
          
          setLoading(false)
          return result
        }
      }
      
      // 클라이언트 데이터가 없으면 API 호출
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      
      if (!response.ok) throw new Error('Failed to run simulation')
      const result = await response.json()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { runSimulation, loading, error }
}