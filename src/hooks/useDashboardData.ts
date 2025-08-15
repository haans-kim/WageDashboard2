import { useState, useEffect } from 'react'

interface DashboardData {
  summary: {
    totalEmployees: number
    fiscalYear: number
    lastUpdated: string
    averageSalary?: number
    totalPayroll?: number
  }
  aiRecommendation: {
    baseUpPercentage: number
    meritIncreasePercentage: number
    totalPercentage: number
    minRange: number
    maxRange: number
  } | null
  budget: {
    totalBudget: string
    usedBudget: string
    remainingBudget: string
    usagePercentage: number
  } | null
  levelStatistics: Array<{
    level: string
    employeeCount: number
    averageSalary: string
    totalSalary: string
    avgBaseUpPercentage: number
    avgMeritPercentage: number
    totalIncreasePercentage: number
  }>
  departmentDistribution: Array<{
    department: string
    count: number
  }>
  performanceDistribution: Array<{
    rating: string
    count: number
  }>
  competitorData?: Array<{
    company: string
    band: string
    level: string
    averageSalary: number
  }> | null
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) throw new Error('Failed to fetch dashboard data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refresh }
}