/**
 * 경쟁사 데이터가 포함된 엑셀 파일 생성
 */

import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

// 직군 리스트
const bands = ['생산', '영업', '생산기술', '경영지원', '품질보증', '기획', '구매&물류', 'Facility']

// C사 평균 급여 데이터 (천원 단위)
const competitorSalaryData = [
  { 직군: '생산',       'Lv.1': 54000, 'Lv.2': 68000, 'Lv.3': 88000, 'Lv.4': 110000 },
  { 직군: '영업',       'Lv.1': 58000, 'Lv.2': 75000, 'Lv.3': 95000, 'Lv.4': 120000 },
  { 직군: '생산기술',   'Lv.1': 56000, 'Lv.2': 72000, 'Lv.3': 92000, 'Lv.4': 115000 },
  { 직군: '경영지원',   'Lv.1': 55000, 'Lv.2': 70000, 'Lv.3': 90000, 'Lv.4': 112000 },
  { 직군: '품질보증',   'Lv.1': 53000, 'Lv.2': 67000, 'Lv.3': 87000, 'Lv.4': 108000 },
  { 직군: '기획',       'Lv.1': 60000, 'Lv.2': 78000, 'Lv.3': 98000, 'Lv.4': 125000 },
  { 직군: '구매&물류',  'Lv.1': 52000, 'Lv.2': 66000, 'Lv.3': 85000, 'Lv.4': 105000 },
  { 직군: 'Facility',   'Lv.1': 50000, 'Lv.2': 63000, 'Lv.3': 82000, 'Lv.4': 100000 }
]

// 직원 샘플 데이터 생성
function generateEmployeeData() {
  const employees: any[] = []
  let empId = 1
  
  // 각 직군별로 직원 생성
  bands.forEach(band => {
    const bandData = competitorSalaryData.find(c => c.직군 === band)
    
    // Lv.4 직원들
    const lv4Count = Math.floor(Math.random() * 5) + 3
    for (let i = 0; i < lv4Count; i++) {
      const baseSalary = bandData?.['Lv.4'] || 100000
      employees.push({
        사번: `EMP${String(empId++).padStart(5, '0')}`,
        이름: `직원${empId}`,
        부서: `${band}팀`,
        직군: band,
        직급: 'Lv.4',
        직책: '부장',
        입사일: `20${10 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        현재연봉: (baseSalary + Math.floor(Math.random() * 20000 - 10000)) * 1000
      })
    }
    
    // Lv.3 직원들
    const lv3Count = Math.floor(Math.random() * 15) + 10
    for (let i = 0; i < lv3Count; i++) {
      const baseSalary = bandData?.['Lv.3'] || 85000
      employees.push({
        사번: `EMP${String(empId++).padStart(5, '0')}`,
        이름: `직원${empId}`,
        부서: `${band}팀`,
        직군: band,
        직급: 'Lv.3',
        직책: '차장',
        입사일: `20${14 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        현재연봉: (baseSalary + Math.floor(Math.random() * 15000 - 7500)) * 1000
      })
    }
    
    // Lv.2 직원들
    const lv2Count = Math.floor(Math.random() * 30) + 20
    for (let i = 0; i < lv2Count; i++) {
      const baseSalary = bandData?.['Lv.2'] || 65000
      employees.push({
        사번: `EMP${String(empId++).padStart(5, '0')}`,
        이름: `직원${empId}`,
        부서: `${band}팀`,
        직군: band,
        직급: 'Lv.2',
        직책: '과장',
        입사일: `20${17 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        현재연봉: (baseSalary + Math.floor(Math.random() * 10000 - 5000)) * 1000
      })
    }
    
    // Lv.1 직원들
    const lv1Count = Math.floor(Math.random() * 25) + 15
    for (let i = 0; i < lv1Count; i++) {
      const baseSalary = bandData?.['Lv.1'] || 50000
      employees.push({
        사번: `EMP${String(empId++).padStart(5, '0')}`,
        이름: `직원${empId}`,
        부서: `${band}팀`,
        직군: band,
        직급: 'Lv.1',
        직책: '대리',
        입사일: `20${19 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        현재연봉: (baseSalary + Math.floor(Math.random() * 8000 - 4000)) * 1000
      })
    }
  })
  
  return employees
}

// AI 설정 데이터
const aiSettings = [
  { 항목: 'Base-up(%)', 값: 3.2 },
  { 항목: '성과인상률(%)', 값: 2.5 },
  { 항목: '총인상률(%)', 값: 5.7 }
]

// 엑셀 파일 생성
function createExcel() {
  const wb = XLSX.utils.book_new()
  
  // 1. 직원기본정보 시트
  const employeeData = generateEmployeeData()
  const ws1 = XLSX.utils.json_to_sheet(employeeData)
  XLSX.utils.book_append_sheet(wb, ws1, '직원기본정보')
  
  // 2. C사데이터 시트 (경쟁사 데이터)
  const ws2 = XLSX.utils.json_to_sheet(competitorSalaryData)
  XLSX.utils.book_append_sheet(wb, ws2, 'C사데이터')
  
  // 3. AI설정 시트
  const ws3 = XLSX.utils.json_to_sheet(aiSettings)
  XLSX.utils.book_append_sheet(wb, ws3, 'AI설정')
  
  // 파일 저장
  const outputDir = path.join(process.cwd(), 'public', 'data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const outputPath = path.join(outputDir, 'sample_with_competitor_v2.xlsx')
  XLSX.writeFile(wb, outputPath)
  
  console.log(`✅ 엑셀 파일이 생성되었습니다: ${outputPath}`)
  console.log(`   - 직원기본정보: ${employeeData.length}명`)
  console.log(`   - C사데이터: ${competitorSalaryData.length}개 직군`)
  console.log(`   - AI설정: ${aiSettings.length}개 항목`)
}

// 실행
createExcel()