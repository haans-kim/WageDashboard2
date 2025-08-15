import { useState, useEffect } from 'react'
import { loadExcelData, hasStoredData } from '@/lib/clientStorage'

export interface Employee {
  id: string
  employeeId?: string
  employeeNumber?: string
  name: string
  department: string
  level: string
  band?: string
  currentSalary: number
  performanceRating?: string | null
  position?: string
  hireDate?: string
  latestCalculation?: {
    baseUpPercentage: number
    meritIncreasePercentage: number
    totalPercentage: number
    suggestedSalary: number
  } | null
}

interface EmployeesResponse {
  employees: Employee[]
  total: number
  page: number
  totalPages: number
}

export function useEmployeesData(filters: {
  page?: number
  limit?: number
  level?: string
  department?: string
  rating?: string
  search?: string
}) {
  const [data, setData] = useState<EmployeesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [filters.page, filters.limit, filters.level, filters.department, filters.rating, filters.search])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 먼저 클라이언트 데이터 확인
      if (hasStoredData()) {
        const clientData = await loadExcelData()
        if (clientData) {
          let filtered = clientData.employees || []
          
          // 필터링
          if (filters.level) {
            filtered = filtered.filter((emp: any) => emp.level === filters.level)
          }
          
          if (filters.department) {
            filtered = filtered.filter((emp: any) => emp.department === filters.department)
          }
          
          if (filters.rating) {
            filtered = filtered.filter((emp: any) => emp.performanceRating === filters.rating)
          }
          
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter((emp: any) => 
              emp.name?.toLowerCase().includes(searchLower) ||
              emp.employeeId?.toLowerCase().includes(searchLower)
            )
          }
          
          // 페이지네이션
          const page = filters.page || 1
          const limit = filters.limit || 20
          const start = (page - 1) * limit
          const end = start + limit
          
          const paginatedEmployees = filtered.slice(start, end)
          
          // ID 추가 (없는 경우)
          const employeesWithId = paginatedEmployees.map((emp: any, index: number) => ({
            ...emp,
            id: emp.id || emp.employeeId || `emp-${index}`
          }))
          
          setData({
            employees: employeesWithId,
            total: filtered.length,
            page,
            totalPages: Math.ceil(filtered.length / limit)
          })
          setLoading(false)
          return
        }
      }
      
      // 클라이언트 데이터가 없으면 API에서 가져오기
      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.level) params.append('level', filters.level)
      if (filters.department) params.append('department', filters.department)
      if (filters.rating) params.append('rating', filters.rating)
      if (filters.search) params.append('search', filters.search)
      
      const response = await fetch(`/api/employees?${params}`)
      if (!response.ok) throw new Error('Failed to fetch employees')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch: fetchData }
}