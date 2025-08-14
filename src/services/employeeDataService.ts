/**
 * 직원 데이터 서비스
 * 엑셀 파일에서 데이터를 읽어오거나 더미 데이터를 생성
 */

import * as XLSX from 'xlsx'
import { 
  EmployeeRecord, 
  convertFromExcelFormat,
  generateEmployeeData,
  calculateBandStatistics,
  LEVEL_INFO
} from '@/lib/bandDataGenerator'

let cachedEmployeeData: EmployeeRecord[] | null = null
let cachedAISettings: {
  baseUpPercentage: number
  meritIncreasePercentage: number
  totalPercentage: number
  minRange: number
  maxRange: number
} | null = null

// 메모리 내 수정된 데이터 저장
let modifiedEmployeeData: EmployeeRecord[] | null = null

/**
 * 캐시 초기화 (서버 사이드에서만 사용)
 */
export function clearCache() {
  if (typeof window === 'undefined') {
    cachedEmployeeData = null
    cachedAISettings = null
    modifiedEmployeeData = null
    console.log('서버 사이드 캐시가 초기화되었습니다.')
  }
}

/**
 * 엑셀 파일에서 직원 데이터 읽기
 */
export async function loadEmployeeDataFromExcel(file?: File): Promise<EmployeeRecord[]> {
  try {
    if (file) {
      // 업로드된 파일 처리
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // AI설정 시트 읽기
      if (workbook.SheetNames.includes('AI설정')) {
        const aiSheet = workbook.Sheets['AI설정']
        const aiData = XLSX.utils.sheet_to_json(aiSheet)
        
        cachedAISettings = {
          baseUpPercentage: aiData.find((row: any) => row['항목'] === 'Base-up(%)')?.['값'] || 3.2,
          meritIncreasePercentage: aiData.find((row: any) => row['항목'] === '성과인상률(%)')?.['값'] || 2.5,
          totalPercentage: aiData.find((row: any) => row['항목'] === '총인상률(%)')?.['값'] || 5.7,
          minRange: aiData.find((row: any) => row['항목'] === '최소범위(%)')?.['값'] || 5.7,
          maxRange: aiData.find((row: any) => row['항목'] === '최대범위(%)')?.['값'] || 5.9
        }
      }
      
      // 직원 데이터 읽기 (직원기본정보 시트 우선, 없으면 첫 번째 시트)
      const employeeSheetName = workbook.SheetNames.includes('직원기본정보') 
        ? '직원기본정보' 
        : workbook.SheetNames.find(name => name.includes('직원')) || workbook.SheetNames[0]
      
      const worksheet = workbook.Sheets[employeeSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      const employees = convertFromExcelFormat(jsonData)
      cachedEmployeeData = employees
      return employees
    }
  } catch (error) {
    console.error('엑셀 파일 로드 실패:', error)
  }
  
  // 파일 로드 실패 시 기본 데이터 생성
  console.log('기본 데이터 생성 중...')
  const employees = generateEmployeeData(4925)
  cachedEmployeeData = employees
  return employees
}

/**
 * 캐시된 직원 데이터 가져오기
 */
export async function getEmployeeData(): Promise<EmployeeRecord[]> {
  // 수정된 데이터가 있으면 우선 반환
  if (modifiedEmployeeData) {
    return modifiedEmployeeData
  }
  
  if (cachedEmployeeData) {
    return cachedEmployeeData
  }
  
  // 서버 사이드에서만 파일 시스템 접근 가능
  // 클라이언트에서는 API를 통해 데이터를 가져옴
  if (typeof window === 'undefined') {
    // 서버 사이드 코드
    try {
      const fs = await import('fs').then(m => m.promises)
      const path = await import('path')
      const XLSX = await import('xlsx')
      
      // 먼저 temp 폴더의 current_data.xlsx 확인
      const tempPath = path.join(process.cwd(), 'temp', 'current_data.xlsx')
      try {
        await fs.access(tempPath)
        const fileBuffer = await fs.readFile(tempPath)
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
        
        // AI설정 시트 읽기
        if (workbook.SheetNames.includes('AI설정')) {
          const aiSheet = workbook.Sheets['AI설정']
          const aiData = XLSX.utils.sheet_to_json(aiSheet)
          
          cachedAISettings = {
            baseUpPercentage: aiData.find((row: any) => row['항목'] === 'Base-up(%)')?.['값'] || 3.2,
            meritIncreasePercentage: aiData.find((row: any) => row['항목'] === '성과인상률(%)')?.['값'] || 2.5,
            totalPercentage: aiData.find((row: any) => row['항목'] === '총인상률(%)')?.['값'] || 5.7,
            minRange: aiData.find((row: any) => row['항목'] === '최소범위(%)')?.['값'] || 5.7,
            maxRange: aiData.find((row: any) => row['항목'] === '최대범위(%)')?.['값'] || 5.9
          }
        }
        
        // 직원 데이터 읽기
        const employeeSheetName = workbook.SheetNames.includes('직원기본정보') 
          ? '직원기본정보' 
          : workbook.SheetNames.find(name => name.includes('직원')) || workbook.SheetNames[0]
        
        const worksheet = workbook.Sheets[employeeSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        const employees = convertFromExcelFormat(jsonData)
        cachedEmployeeData = employees
        console.log('저장된 데이터 파일에서 로드 완료:', employees.length, '명')
        return employees
      } catch {
        // temp 파일이 없으면 기본 파일 시도
      }
      
      // 초기 로드 시 public 폴더의 기본 파일 시도
      const publicPath = path.join(process.cwd(), 'public', 'data', 'default_employee_data.xlsx')
      try {
        await fs.access(publicPath)
        const fileBuffer = await fs.readFile(publicPath)
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
        
        // AI설정 시트 읽기
        if (workbook.SheetNames.includes('AI설정')) {
          const aiSheet = workbook.Sheets['AI설정']
          const aiData = XLSX.utils.sheet_to_json(aiSheet)
          
          cachedAISettings = {
            baseUpPercentage: aiData.find((row: any) => row['항목'] === 'Base-up(%)')?.['값'] || 3.2,
            meritIncreasePercentage: aiData.find((row: any) => row['항목'] === '성과인상률(%)')?.['값'] || 2.5,
            totalPercentage: aiData.find((row: any) => row['항목'] === '총인상률(%)')?.['값'] || 5.7,
            minRange: aiData.find((row: any) => row['항목'] === '최소범위(%)')?.['값'] || 5.7,
            maxRange: aiData.find((row: any) => row['항목'] === '최대범위(%)')?.['값'] || 5.9
          }
        }
        
        // 직원 데이터 읽기
        const employeeSheetName = workbook.SheetNames.includes('직원기본정보') 
          ? '직원기본정보' 
          : workbook.SheetNames.find(name => name.includes('직원')) || workbook.SheetNames[0]
        
        const worksheet = workbook.Sheets[employeeSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        const employees = convertFromExcelFormat(jsonData)
        cachedEmployeeData = employees
        console.log('기본 Excel 파일에서 데이터 로드 완료:', employees.length, '명')
        return employees
      } catch {
        console.log('파일 로드 실패, 생성된 데이터 사용')
      }
    } catch (error) {
      console.log('서버 사이드 파일 로드 오류:', error)
    }
  }
  
  // Excel 파일이 없으면 기본 데이터 생성
  console.log('기본 데이터 생성 중...')
  const employees = generateEmployeeData(4925)
  cachedEmployeeData = employees
  return employees
}

/**
 * AI 설정 가져오기
 */
export function getAISettings() {
  return cachedAISettings || {
    baseUpPercentage: 3.2,
    meritIncreasePercentage: 2.5,
    totalPercentage: 5.7,
    minRange: 5.7,
    maxRange: 5.9
  }
}

/**
 * 직급별 통계 계산 (대시보드용)
 */
export async function getLevelStatistics() {
  const employees = await getEmployeeData()
  
  const levels = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1', '신입']
  
  return levels.map(level => {
    const levelEmployees = employees.filter(e => e.level === level)
    const totalSalary = levelEmployees.reduce((sum, e) => sum + e.currentSalary, 0)
    const avgSalary = levelEmployees.length > 0 ? totalSalary / levelEmployees.length : 0
    
    return {
      level,
      employeeCount: levelEmployees.length,
      averageSalary: Math.round(avgSalary),
      totalSalary,
      minSalary: levelEmployees.length > 0 ? Math.min(...levelEmployees.map(e => e.currentSalary)) : 0,
      maxSalary: levelEmployees.length > 0 ? Math.max(...levelEmployees.map(e => e.currentSalary)) : 0
    }
  }).filter(stat => stat.employeeCount > 0) // 인원이 0인 직급 제외
}

/**
 * 직군별 통계 계산 (Pay Band용)
 */
export async function getBandStatistics() {
  const employees = await getEmployeeData()
  return calculateBandStatistics(employees)
}

/**
 * 직군×직급 상세 데이터
 */
export async function getBandLevelDetails() {
  const employees = await getEmployeeData()
  const bandStats = calculateBandStatistics(employees)
  
  const result: any[] = []
  
  Object.values(bandStats).forEach((band: any) => {
    const bandData = {
      id: band.name.toLowerCase().replace(/[&\s]/g, '_'),
      name: band.name,
      totalHeadcount: band.totalHeadcount,
      avgBaseUpRate: 3.2,
      avgSBLIndex: 95, // 임시값
      avgCAIndex: 102, // 임시값
      totalBudgetImpact: band.totalHeadcount * band.avgSalary * 0.057, // 5.7% 인상
      levels: band.levels.map((level: any) => {
        // C사 대비 경쟁력 계산을 위한 시장 데이터 (가상)
        const marketMedian = level.level === 'Lv.4' ? 115000000 :
                            level.level === 'Lv.3' ? 92000000 :
                            level.level === 'Lv.2' ? 72000000 :
                            level.level === 'Lv.1' ? 56000000 : 40000000
        
        const competitiveness = (level.meanSalary / marketMedian) * 100
        
        return {
          level: level.level,
          headcount: level.headcount,
          meanBasePay: level.meanSalary,
          baseUpKRW: Math.round(level.meanSalary * 0.032),
          baseUpRate: 3.2,
          sblIndex: Math.round(competitiveness),
          caIndex: Math.round(competitiveness * 1.05),
          competitiveness: Math.round(competitiveness),
          market: {
            min: level.minSalary,
            q1: level.q1Salary,
            median: level.medianSalary,
            q3: level.q3Salary,
            max: level.maxSalary
          },
          company: {
            median: level.medianSalary,
            mean: level.meanSalary,
            values: [] // 개별 급여 값은 제외 (너무 많음)
          },
          competitor: {
            median: marketMedian
          }
        }
      })
    }
    
    result.push(bandData)
  })
  
  return result
}

/**
 * 대시보드용 요약 데이터
 */
export async function getDashboardSummary() {
  const employees = await getEmployeeData()
  const levelStats = await getLevelStatistics()
  
  // 전체 평균 급여
  const totalSalary = employees.reduce((sum, e) => sum + e.currentSalary, 0)
  const avgSalary = totalSalary / employees.length
  
  // AI 제안 인상률 (캐시된 값 또는 기본값)
  const aiRecommendation = cachedAISettings || {
    baseUpPercentage: 3.2,
    meritIncreasePercentage: 2.5,
    totalPercentage: 5.7,
    minRange: 5.7,
    maxRange: 5.9
  }
  
  // 예산 정보 (AI 설정값 기반으로 동적 계산)
  const totalBudget = totalSalary * (aiRecommendation.totalPercentage / 100)
  
  return {
    summary: {
      totalEmployees: employees.length,
      averageSalary: Math.round(avgSalary),
      totalPayroll: totalSalary,
      lastUpdated: new Date().toISOString()
    },
    aiRecommendation,
    budget: {
      totalBudget,
      baseUpBudget: totalSalary * (aiRecommendation.baseUpPercentage / 100),
      meritBudget: totalSalary * (aiRecommendation.meritIncreasePercentage / 100),
      usedBudget: 0,
      remainingBudget: totalBudget
    },
    levelStatistics: levelStats,
    industryComparison: {
      ourCompany: aiRecommendation.totalPercentage,
      competitor: 4.2,
      industry: 4.5
    }
  }
}

/**
 * 엑셀 파일 업로드 처리
 */
export async function uploadEmployeeExcel(file: File): Promise<{
  success: boolean
  message: string
  data?: any
}> {
  try {
    const employees = await loadEmployeeDataFromExcel(file)
    
    if (employees.length === 0) {
      return {
        success: false,
        message: '유효한 데이터가 없습니다.'
      }
    }
    
    // 데이터 검증
    const requiredFields = ['employeeId', 'name', 'department', 'level', 'currentSalary']
    const invalidRows = employees.filter(emp => 
      requiredFields.some(field => !emp[field as keyof EmployeeRecord])
    )
    
    if (invalidRows.length > 0) {
      return {
        success: false,
        message: `${invalidRows.length}개 행에 필수 데이터가 누락되었습니다.`
      }
    }
    
    // 캐시에 새 데이터 저장
    cachedEmployeeData = employees
    modifiedEmployeeData = employees
    
    // 파일 저장은 API 라우트에서 처리 (서버 사이드에서만 가능)
    
    return {
      success: true,
      message: `${employees.length}명의 직원 데이터를 성공적으로 로드했습니다.`,
      data: {
        totalCount: employees.length,
        levelDistribution: await getLevelStatistics(),
        bandDistribution: await getBandStatistics()
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `파일 처리 중 오류가 발생했습니다: ${error}`
    }
  }
}

/**
 * 직원 데이터 업데이트
 */
export async function updateEmployee(id: string, updates: Partial<EmployeeRecord>): Promise<EmployeeRecord | null> {
  const employees = await getEmployeeData()
  const index = employees.findIndex(emp => emp.employeeId === id)
  
  if (index === -1) {
    return null
  }
  
  // 수정된 데이터가 없으면 원본 복사
  if (!modifiedEmployeeData) {
    modifiedEmployeeData = [...employees]
  }
  
  // 업데이트
  modifiedEmployeeData[index] = {
    ...modifiedEmployeeData[index],
    ...updates
  }
  
  return modifiedEmployeeData[index]
}

/**
 * 직원 검색
 */
export async function searchEmployees(params: {
  page?: number
  limit?: number
  level?: string
  department?: string
  search?: string
}): Promise<{
  employees: EmployeeRecord[]
  total: number
  page: number
  totalPages: number
}> {
  const employees = await getEmployeeData()
  
  // 필터링
  let filtered = employees
  
  if (params.level) {
    filtered = filtered.filter(emp => emp.level === params.level)
  }
  
  if (params.department) {
    filtered = filtered.filter(emp => emp.department === params.department)
  }
  
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = filtered.filter(emp => 
      emp.name.toLowerCase().includes(searchLower) ||
      emp.employeeId.toLowerCase().includes(searchLower)
    )
  }
  
  // 페이지네이션
  const page = params.page || 1
  const limit = params.limit || 20
  const start = (page - 1) * limit
  const end = start + limit
  
  const paginatedEmployees = filtered.slice(start, end)
  
  return {
    employees: paginatedEmployees,
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit)
  }
}

/**
 * 직원별 급여 계산
 */
export async function calculateEmployeeSalary(
  employeeId: string,
  baseUpPercentage: number,
  meritPercentage: number
): Promise<{
  currentSalary: number
  baseUpAmount: number
  meritAmount: number
  suggestedSalary: number
  totalIncreasePercentage: number
} | null> {
  const employees = await getEmployeeData()
  const employee = employees.find(emp => emp.employeeId === employeeId)
  
  if (!employee) {
    return null
  }
  
  const baseUpAmount = Math.round(employee.currentSalary * (baseUpPercentage / 100))
  const meritAmount = Math.round(employee.currentSalary * (meritPercentage / 100))
  const suggestedSalary = employee.currentSalary + baseUpAmount + meritAmount
  const totalIncreasePercentage = ((suggestedSalary - employee.currentSalary) / employee.currentSalary) * 100
  
  return {
    currentSalary: employee.currentSalary,
    baseUpAmount,
    meritAmount,
    suggestedSalary,
    totalIncreasePercentage
  }
}

/**
 * 급여 시뮬레이션
 */
export async function simulateSalaryIncrease(params: {
  level?: string
  department?: string
  baseUpPercentage: number
  meritIncreasePercentage: number
}): Promise<{
  affectedEmployees: number
  currentTotal: number
  projectedTotal: number
  totalIncrease: number
  averageIncreasePercentage: number
  details: Array<{
    employeeId: string
    name: string
    level: string
    department: string
    currentSalary: number
    suggestedSalary: number
    increaseAmount: number
    increasePercentage: number
  }>
}> {
  const employees = await getEmployeeData()
  
  // 필터링
  let filtered = employees
  if (params.level) {
    filtered = filtered.filter(emp => emp.level === params.level)
  }
  if (params.department) {
    filtered = filtered.filter(emp => emp.department === params.department)
  }
  
  // 시뮬레이션
  const details = filtered.map(emp => {
    const baseUpAmount = Math.round(emp.currentSalary * (params.baseUpPercentage / 100))
    const meritAmount = Math.round(emp.currentSalary * (params.meritIncreasePercentage / 100))
    const suggestedSalary = emp.currentSalary + baseUpAmount + meritAmount
    const increaseAmount = suggestedSalary - emp.currentSalary
    const increasePercentage = (increaseAmount / emp.currentSalary) * 100
    
    return {
      employeeId: emp.employeeId,
      name: emp.name,
      level: emp.level,
      department: emp.department,
      currentSalary: emp.currentSalary,
      suggestedSalary,
      increaseAmount,
      increasePercentage
    }
  })
  
  const currentTotal = details.reduce((sum, d) => sum + d.currentSalary, 0)
  const projectedTotal = details.reduce((sum, d) => sum + d.suggestedSalary, 0)
  const totalIncrease = projectedTotal - currentTotal
  const averageIncreasePercentage = currentTotal > 0 ? (totalIncrease / currentTotal) * 100 : 0
  
  return {
    affectedEmployees: details.length,
    currentTotal,
    projectedTotal,
    totalIncrease,
    averageIncreasePercentage,
    details
  }
}

/**
 * 현재 메모리의 데이터를 엑셀로 내보내기
 */
export function exportCurrentData(): EmployeeRecord[] {
  return modifiedEmployeeData || cachedEmployeeData || []
}