import { useState, useEffect } from 'react'
import { loadExcelData, hasStoredData } from '@/lib/clientStorage'

export function useAnalyticsData() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // 먼저 클라이언트 데이터 확인
        if (hasStoredData()) {
          const clientData = await loadExcelData()
          if (clientData) {
            // 클라이언트 데이터를 분석 형식으로 변환
            const employees = clientData.employees || []
            
            // 급여 분포 계산
            const salaryDistribution: any[] = []
            const ranges = [
              { min: 0, max: 30000000, label: '~3천만' },
              { min: 30000000, max: 40000000, label: '3~4천만' },
              { min: 40000000, max: 50000000, label: '4~5천만' },
              { min: 50000000, max: 60000000, label: '5~6천만' },
              { min: 60000000, max: 70000000, label: '6~7천만' },
              { min: 70000000, max: 80000000, label: '7~8천만' },
              { min: 80000000, max: 90000000, label: '8~9천만' },
              { min: 90000000, max: 100000000, label: '9천만~1억' },
              { min: 100000000, max: Infinity, label: '1억 이상' }
            ]
            
            ranges.forEach(range => {
              const count = employees.filter((e: any) => 
                e.currentSalary >= range.min && e.currentSalary < range.max
              ).length
              if (count > 0) {
                salaryDistribution.push({
                  range: range.label,
                  count
                })
              }
            })
            
            // 부서별 분석
            const deptMap = new Map()
            employees.forEach((e: any) => {
              if (!deptMap.has(e.department)) {
                deptMap.set(e.department, {
                  employees: [],
                  totalSalary: 0,
                  count: 0
                })
              }
              const dept = deptMap.get(e.department)
              dept.employees.push(e)
              dept.totalSalary += e.currentSalary || 0
              dept.count++
            })
            
            const departmentAnalysis = Array.from(deptMap.entries()).map(([name, data]) => ({
              department: name,
              employeeCount: data.count,
              averageSalary: Math.round(data.totalSalary / data.count),
              totalPayroll: data.totalSalary
            }))
            
            // 성과 분석
            const perfMap = new Map()
            employees.forEach((e: any) => {
              const key = `${e.level}-${e.performanceRating}`
              if (!perfMap.has(key)) {
                perfMap.set(key, {
                  level: e.level,
                  performanceRating: e.performanceRating,
                  totalSalary: 0,
                  count: 0
                })
              }
              const perf = perfMap.get(key)
              perf.totalSalary += e.currentSalary || 0
              perf.count++
            })
            
            const performanceAnalysis = Array.from(perfMap.values()).map(data => ({
              level: data.level,
              performanceRating: data.performanceRating,
              count: data.count,
              averageSalary: Math.round(data.totalSalary / data.count)
            }))
            
            // 직급별 통계
            const levelStats = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1'].map(level => {
              const levelEmployees = employees.filter((e: any) => e.level === level)
              const totalSalary = levelEmployees.reduce((sum: number, e: any) => sum + (e.currentSalary || 0), 0)
              return {
                level,
                employeeCount: levelEmployees.length,
                averageSalary: levelEmployees.length > 0 ? Math.round(totalSalary / levelEmployees.length) : 0,
                minSalary: levelEmployees.length > 0 ? Math.min(...levelEmployees.map((e: any) => e.currentSalary)) : 0,
                maxSalary: levelEmployees.length > 0 ? Math.max(...levelEmployees.map((e: any) => e.currentSalary)) : 0
              }
            }).filter(stat => stat.employeeCount > 0)
            
            const analyticsData = {
              salaryDistribution,
              departmentAnalysis,
              performanceAnalysis,
              levelStatistics: levelStats,
              summary: {
                totalEmployees: employees.length,
                averageSalary: Math.round(employees.reduce((sum: number, e: any) => sum + (e.currentSalary || 0), 0) / employees.length),
                totalPayroll: employees.reduce((sum: number, e: any) => sum + (e.currentSalary || 0), 0)
              }
            }
            
            setData(analyticsData)
            setLoading(false)
            return
          }
        }
        
        // 클라이언트 데이터가 없으면 API에서 가져오기
        const response = await fetch('/api/analytics')
        if (!response.ok) throw new Error('Failed to fetch analytics data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setData({})
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}