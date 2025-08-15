import { useState, useEffect } from 'react'
import { loadExcelData, hasStoredData } from '@/lib/clientStorage'
import { useWageContext } from '@/context/WageContext'

export function useAnalyticsData() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { baseUpRate, meritRate } = useWageContext()

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
            
            const departmentAnalysis = Array.from(deptMap.entries()).map(([name, data]) => {
              const salaries = data.employees.map((e: any) => e.currentSalary || 0)
              return {
                department: name,
                employeeCount: data.count,
                averageSalary: data.count > 0 ? Math.round(data.totalSalary / data.count) : 0,
                totalPayroll: data.totalSalary,
                minSalary: salaries.length > 0 ? Math.min(...salaries) : 0,
                maxSalary: salaries.length > 0 ? Math.max(...salaries) : 0,
                salaryRange: salaries.length > 0 ? Math.max(...salaries) - Math.min(...salaries) : 0
              }
            })
            
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
            
            // 직급별 통계 - WageContext의 인상률 반영 (0이면 AI 설정 사용)
            const effectiveBaseUp = baseUpRate || clientData.aiSettings?.baseUpPercentage || 3.2
            const effectiveMerit = meritRate || clientData.aiSettings?.meritIncreasePercentage || 2.5
            
            const levelStats = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1'].map(level => {
              const levelEmployees = employees.filter((e: any) => e.level === level)
              const totalSalary = levelEmployees.reduce((sum: number, e: any) => sum + (e.currentSalary || 0), 0)
              return {
                level,
                employeeCount: levelEmployees.length,
                averageSalary: levelEmployees.length > 0 ? Math.round(totalSalary / levelEmployees.length) : 0,
                minSalary: levelEmployees.length > 0 ? Math.min(...levelEmployees.map((e: any) => e.currentSalary)) : 0,
                maxSalary: levelEmployees.length > 0 ? Math.max(...levelEmployees.map((e: any) => e.currentSalary)) : 0,
                totalSalary: totalSalary.toString(),
                avgBaseUpPercentage: effectiveBaseUp,  // Context 값 또는 AI 설정값
                avgMeritPercentage: effectiveMerit,    // Context 값 또는 AI 설정값
                totalIncreasePercentage: effectiveBaseUp + effectiveMerit  // 합계
              }
            }).filter(stat => stat.employeeCount > 0)
            
            // 예산 활용률 계산
            const totalPayroll = employees.reduce((sum: number, e: any) => sum + (e.currentSalary || 0), 0)
            const totalBudget = totalPayroll * 1.2 // 총 급여의 120%를 예산으로 가정
            
            // 인상률 시뮬레이션 (projections)
            const projections = []
            for (let rate = 0; rate <= 10; rate += 0.5) {
              const totalCurrent = totalPayroll
              const totalProjected = employees.reduce((sum: number, emp: any) => 
                sum + Math.round((emp.currentSalary || 0) * (1 + rate / 100)), 0
              )
              
              projections.push({
                rate,
                totalCurrent,
                totalProjected,
                increase: totalProjected - totalCurrent,
                budgetImpact: totalCurrent > 0 ? ((totalProjected - totalCurrent) / totalCurrent) * 100 : 0,
              })
            }
            
            // 근속년수별 통계
            const currentYear = new Date().getFullYear()
            const tenureGroups = [
              { min: 0, max: 2, label: '2년 미만' },
              { min: 2, max: 5, label: '2-5년' },
              { min: 5, max: 10, label: '5-10년' },
              { min: 10, max: Infinity, label: '10년 이상' },
            ]
            
            const tenureStats = tenureGroups.map(group => {
              const groupEmployees = employees.filter((emp: any) => {
                const yearsOfService = emp.hireDate 
                  ? currentYear - new Date(emp.hireDate).getFullYear()
                  : 0
                return yearsOfService >= group.min && 
                       (group.max === Infinity || yearsOfService < group.max)
              })
              
              const avgSalary = groupEmployees.length > 0
                ? Math.round(groupEmployees.reduce((sum: number, emp: any) => sum + (emp.currentSalary || 0), 0) / groupEmployees.length)
                : 0
              
              return {
                tenure: group.label,
                employeeCount: groupEmployees.length,
                averageSalary: avgSalary,
              }
            })
            
            // 평가등급 분포
            const performanceDistribution = ['S', 'A', 'B', 'C'].map(rating => ({
              rating,
              count: employees.filter((e: any) => e.performanceRating === rating).length
            }))
            
            // 평가등급별 평균급여
            const performanceSalary = ['S', 'A', 'B', 'C'].map(rating => {
              const ratingEmployees = employees.filter((e: any) => e.performanceRating === rating)
              const avgSalary = ratingEmployees.length > 0
                ? Math.round(ratingEmployees.reduce((sum: number, e: any) => sum + (e.currentSalary || 0), 0) / ratingEmployees.length)
                : 0
              return {
                rating,
                averageSalary: avgSalary,
                count: ratingEmployees.length,
              }
            })
            
            // 직급×평가등급 히트맵
            const levelPerformance = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1'].map(level => {
              const levelData: any = { level }
              ;['S', 'A', 'B', 'C'].forEach(rating => {
                levelData[rating] = employees.filter((e: any) => 
                  e.level === level && e.performanceRating === rating
                ).length
              })
              return levelData
            })
            
            const analyticsData = {
              salaryDistribution,
              departmentAnalysis,
              performanceAnalysis,
              levelStatistics: levelStats,
              projections,
              tenureStats,
              budgetUtilization: {
                totalBudget: totalBudget.toString(),
                usedBudget: totalPayroll.toString(),
                utilizationRate: totalBudget > 0 ? (totalPayroll / totalBudget) * 100 : 0,
              },
              performanceDistribution,
              performanceSalary,
              levelPerformance,
              summary: {
                totalEmployees: employees.length,
                averageSalary: employees.length > 0 
                  ? Math.round(totalPayroll / employees.length)
                  : 0,
                totalPayroll
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