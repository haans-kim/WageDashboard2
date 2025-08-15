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
  calculatePercentile,
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

// 경쟁사 데이터 구조 (집계 데이터)
interface CompetitorData {
  company: string      // 회사명 (C사)
  band: string        // 직군
  level: string       // 직급
  averageSalary: number  // 평균연봉
}

// 경쟁사 데이터 캐시
let cachedCompetitorData: CompetitorData[] | null = null

// 메모리 내 수정된 데이터 저장
let modifiedEmployeeData: EmployeeRecord[] | null = null

// 업로드된 데이터를 임시로 저장 (Vercel 서버리스 환경)
const uploadedDataCache = new Map<string, EmployeeRecord[]>()

/**
 * 캐시 초기화 (서버 사이드에서만 사용)
 */
export function clearCache() {
  if (typeof window === 'undefined') {
    cachedEmployeeData = null
    cachedAISettings = null
    cachedCompetitorData = null
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
          baseUpPercentage: (aiData.find((row: any) => row['항목'] === 'Base-up(%)') as any)?.['값'] || 3.2,
          meritIncreasePercentage: (aiData.find((row: any) => row['항목'] === '성과인상률(%)') as any)?.['값'] || 2.5,
          totalPercentage: (aiData.find((row: any) => row['항목'] === '총인상률(%)') as any)?.['값'] || 5.7,
          minRange: (aiData.find((row: any) => row['항목'] === '최소범위(%)') as any)?.['값'] || 5.7,
          maxRange: (aiData.find((row: any) => row['항목'] === '최대범위(%)') as any)?.['값'] || 5.9
        }
      }
      
      // C사데이터 시트 읽기 (직군×직급 매트릭스)
      if (workbook.SheetNames.includes('C사데이터')) {
        const competitorSheet = workbook.Sheets['C사데이터']
        const competitorRawData = XLSX.utils.sheet_to_json(competitorSheet)
        
        // 집계 데이터 형식으로 변환
        const competitorData: CompetitorData[] = []
        competitorRawData.forEach((row: any) => {
          const band = row['직군']
          if (band) {
            // 각 레벨에 대한 데이터 처리
            ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'].forEach(level => {
              if (row[level]) {
                competitorData.push({
                  company: 'C사',
                  band: band,
                  level: level,
                  averageSalary: row[level] * 1000 // 천원 단위를 원 단위로
                })
              }
            })
          }
        })
        
        cachedCompetitorData = competitorData
        console.log('C사 데이터 로드:', competitorData.length, '개 직군×직급 데이터')
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
  
  // Vercel 환경에서는 캐시를 짧게 유지
  if (cachedEmployeeData && process.env.VERCEL !== '1') {
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
      
      // 먼저 temp 폴더의 current_data.xlsx 확인 (Vercel에서는 /tmp 사용)
      const tempDir = process.env.VERCEL === '1' ? '/tmp' : path.join(process.cwd(), 'temp')
      const tempPath = path.join(tempDir, 'current_data.xlsx')
      try {
        await fs.access(tempPath)
        const fileBuffer = await fs.readFile(tempPath)
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
        
        // AI설정 시트 읽기
        if (workbook.SheetNames.includes('AI설정')) {
          const aiSheet = workbook.Sheets['AI설정']
          const aiData = XLSX.utils.sheet_to_json(aiSheet)
          
          cachedAISettings = {
            baseUpPercentage: (aiData.find((row: any) => row['항목'] === 'Base-up(%)') as any)?.['값'] || 3.2,
            meritIncreasePercentage: (aiData.find((row: any) => row['항목'] === '성과인상률(%)') as any)?.['값'] || 2.5,
            totalPercentage: (aiData.find((row: any) => row['항목'] === '총인상률(%)') as any)?.['값'] || 5.7,
            minRange: (aiData.find((row: any) => row['항목'] === '최소범위(%)') as any)?.['값'] || 5.7,
            maxRange: (aiData.find((row: any) => row['항목'] === '최대범위(%)') as any)?.['값'] || 5.9
          }
        }
        
        // C사데이터 시트 읽기
        if (workbook.SheetNames.includes('C사데이터')) {
          const competitorSheet = workbook.Sheets['C사데이터']
          const competitorRawData = XLSX.utils.sheet_to_json(competitorSheet)
          
          // 집계 데이터 형식으로 변환
          const competitorData: CompetitorData[] = []
          competitorRawData.forEach((row: any) => {
            const band = row['직군']
            if (band) {
              // 각 레벨에 대한 데이터 처리
              ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'].forEach(level => {
                if (row[level]) {
                  competitorData.push({
                    company: 'C사',
                    band: band,
                    level: level,
                    averageSalary: row[level] * 1000 // 천원 단위를 원 단위로
                  })
                }
              })
            }
          })
          
          cachedCompetitorData = competitorData
          console.log('C사 데이터 로드:', competitorData.length, '개 직군×직급 데이터')
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
      
      // 초기 로드 시 기본 파일 시도 - Vercel 환경 고려
      // Vercel에서는 .next/server/app 경로를 확인
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'data', 'SBL_employee_data_comp.xlsx'),
        path.join(process.cwd(), 'data', 'SBL_employee_data_comp.xlsx'),
        path.join(process.cwd(), '.next/server/app', 'public', 'data', 'SBL_employee_data_comp.xlsx')
      ]
      
      let fileBuffer: Buffer | null = null
      let loadedPath = ''
      
      for (const tryPath of possiblePaths) {
        try {
          await fs.access(tryPath)
          fileBuffer = await fs.readFile(tryPath)
          loadedPath = tryPath
          console.log('파일 로드 성공:', loadedPath)
          break
        } catch {
          console.log('파일 경로 실패:', tryPath)
          continue
        }
      }
      
      if (fileBuffer) {
        try {
          const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
        
        // AI설정 시트 읽기
        if (workbook.SheetNames.includes('AI설정')) {
          const aiSheet = workbook.Sheets['AI설정']
          const aiData = XLSX.utils.sheet_to_json(aiSheet)
          
          cachedAISettings = {
            baseUpPercentage: (aiData.find((row: any) => row['항목'] === 'Base-up(%)') as any)?.['값'] || 3.2,
            meritIncreasePercentage: (aiData.find((row: any) => row['항목'] === '성과인상률(%)') as any)?.['값'] || 2.5,
            totalPercentage: (aiData.find((row: any) => row['항목'] === '총인상률(%)') as any)?.['값'] || 5.7,
            minRange: (aiData.find((row: any) => row['항목'] === '최소범위(%)') as any)?.['값'] || 5.7,
            maxRange: (aiData.find((row: any) => row['항목'] === '최대범위(%)') as any)?.['값'] || 5.9
          }
        }
        
        // C사데이터 시트 읽기
        if (workbook.SheetNames.includes('C사데이터')) {
          const competitorSheet = workbook.Sheets['C사데이터']
          const competitorRawData = XLSX.utils.sheet_to_json(competitorSheet)
          
          // 집계 데이터 형식으로 변환
          const competitorData: CompetitorData[] = []
          competitorRawData.forEach((row: any) => {
            const band = row['직군']
            if (band) {
              // 각 레벨에 대한 데이터 처리
              ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'].forEach(level => {
                if (row[level]) {
                  competitorData.push({
                    company: 'C사',
                    band: band,
                    level: level,
                    averageSalary: row[level] * 1000 // 천원 단위를 원 단위로
                  })
                }
              })
            }
          })
          
          cachedCompetitorData = competitorData
          console.log('C사 데이터 로드:', competitorData.length, '개 직군×직급 데이터')
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
        } catch (fileError) {
          console.log('파일 로드 실패, 생성된 데이터 사용')
        }
      }
    } catch (error) {
      console.log('서버 사이드 파일 로드 오류:', error)
    }
  }
  
  // Excel 파일이 없으면 기본 샘플 데이터 반환
  console.log('기본 샘플 데이터 사용')
  const sampleEmployees = generateEmployeeData()
  cachedEmployeeData = sampleEmployees
  return sampleEmployees
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
 * 경쟁사 데이터 가져오기
 */
export function getCompetitorData(): CompetitorData[] {
  return cachedCompetitorData || []
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
  const competitorData = getCompetitorData()
  
  // 실제 데이터에서 유니크한 직군 추출
  const uniqueBands = Array.from(new Set(employees.map(e => e.band).filter(Boolean))).sort()
  
  const result: any[] = []
  
  // 각 직군별로 통계 계산
  for (const bandName of uniqueBands) {
    const bandEmployees = employees.filter(e => e.band === bandName)
    const levels = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1', '신입']
    
    const levelStats = levels.map(level => {
      const levelEmployees = bandEmployees.filter(e => e.level === level)
      const salaries = levelEmployees.map(e => e.currentSalary)
      
      // 우리 회사 평균 급여
      const ourAvgSalary = salaries.length > 0 
        ? salaries.reduce((a, b) => a + b, 0) / salaries.length 
        : 0
      
      // C사 평균 급여 찾기
      const competitorEntry = competitorData.find(
        c => c.band === bandName && c.level === level
      )
      const competitorAvgSalary = competitorEntry?.averageSalary || 0
      
      // 경쟁력 계산 (우리 회사 / C사 * 100)
      const competitiveness = competitorAvgSalary > 0 
        ? Math.round((ourAvgSalary / competitorAvgSalary) * 100)
        : 0
      
      return {
        level,
        headcount: levelEmployees.length,
        meanBasePay: ourAvgSalary,
        baseUpKRW: Math.round(ourAvgSalary * 0.032),
        baseUpRate: 3.2,
        sblIndex: competitiveness,  // 우리회사 vs C사 경쟁력
        caIndex: competitorAvgSalary,  // C사 평균 급여
        competitiveness: competitiveness,
        market: {
          min: salaries.length > 0 ? Math.min(...salaries) : 0,
          q1: calculatePercentile(salaries, 25),
          median: calculatePercentile(salaries, 50),
          q3: calculatePercentile(salaries, 75),
          max: salaries.length > 0 ? Math.max(...salaries) : 0
        },
        company: {
          median: calculatePercentile(salaries, 50),
          mean: ourAvgSalary,
          values: []
        },
        competitor: {
          median: competitorAvgSalary
        }
      }
    }).filter(level => level.level !== '신입') // 신입 제외
    
    const totalHeadcount = bandEmployees.length
    const avgSalary = totalHeadcount > 0
      ? bandEmployees.reduce((sum, e) => sum + e.currentSalary, 0) / totalHeadcount
      : 0
    
    const bandData = {
      id: bandName.toLowerCase().replace(/[&\s]/g, '_'),
      name: bandName,
      totalHeadcount,
      avgBaseUpRate: 3.2,
      avgSBLIndex: 95,
      avgCAIndex: 102,
      totalBudgetImpact: totalHeadcount * avgSalary * 0.057,
      levels: levelStats
    }
    
    result.push(bandData)
  }
  
  return result
}

/**
 * 대시보드용 요약 데이터
 */
export async function getDashboardSummary() {
  const employees = await getEmployeeData()
  
  // 데이터가 없으면 빈 응답 반환
  if (!employees || employees.length === 0) {
    return {
      summary: {
        totalEmployees: 0,
        averageSalary: 0,
        totalPayroll: 0,
        lastUpdated: new Date().toISOString()
      },
      aiRecommendation: null,
      budget: null,
      levelStatistics: [],
      industryComparison: null
    }
  }
  
  const levelStats = await getLevelStatistics()
  const competitorData = getCompetitorData()
  
  // 전체 평균 급여
  const totalSalary = employees.reduce((sum, e) => sum + e.currentSalary, 0)
  const avgSalary = totalSalary / employees.length
  
  // 경쟁사 평균 급여 계산
  let competitorAvgSalary = 0
  if (competitorData && competitorData.length > 0) {
    const totalCompetitorSalary = competitorData.reduce((sum, c) => sum + c.averageSalary, 0)
    competitorAvgSalary = totalCompetitorSalary / competitorData.length
  }
  
  // AI 제안 인상률 (캐시된 값 또는 기본값)
  const aiRecommendation = cachedAISettings || {
    baseUpPercentage: 3.2,
    meritIncreasePercentage: 2.5,
    totalPercentage: 5.7,
    minRange: 5.7,
    maxRange: 5.9
  }
  
  // 예산 정보 (AI 설정값 기반으로 동적 계산 + 간접비용 17.8% 포함)
  const directBudget = totalSalary * (aiRecommendation.totalPercentage / 100)
  const indirectCost = directBudget * 0.178 // 간접비용 17.8% (퇴직급여 4.5% + 4대보험 11.3% + 개인연금 2.0%)
  const totalBudget = directBudget + indirectCost // 총예산 = 직접비용 + 간접비용
  
  return {
    summary: {
      totalEmployees: employees.length,
      averageSalary: Math.round(avgSalary),
      totalPayroll: totalSalary,
      lastUpdated: new Date().toISOString()
    },
    aiRecommendation,
    budget: {
      totalBudget: Math.round(totalBudget).toString(), // 총예산 (간접비용 포함, 소수점 제거)
      baseUpBudget: totalSalary * (aiRecommendation.baseUpPercentage / 100),
      meritBudget: totalSalary * (aiRecommendation.meritIncreasePercentage / 100),
      usedBudget: 0,
      remainingBudget: totalBudget
    },
    levelStatistics: levelStats,
    industryComparison: {
      ourCompany: aiRecommendation.totalPercentage,
      competitor: competitorAvgSalary > 0 ? Math.round((competitorAvgSalary / avgSalary - 1) * 1000) / 10 : 4.2, // C사 인상률 자동 계산
      industry: competitorAvgSalary > 0 ? Math.round((competitorAvgSalary / avgSalary - 1) * 1000) / 10 + 0.3 : 4.5 // 동종업계 = C사 + 0.3%
    },
    competitorData: cachedCompetitorData // 경쟁사 데이터
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