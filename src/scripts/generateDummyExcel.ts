/**
 * 더미 엑셀 파일 생성 스크립트
 * 4925명의 직원 데이터를 엑셀 파일로 생성
 */

import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'
import { 
  generateEmployeeData, 
  convertToExcelFormat,
  calculateBandStatistics 
} from '../lib/bandDataGenerator'

// 더미 데이터 생성
console.log('🔄 4925명의 직원 데이터 생성 중...')
const employees = generateEmployeeData(4925)

// 엑셀 형식으로 변환
const excelData = convertToExcelFormat(employees)

// 직군별 통계 계산
const bandStats = calculateBandStatistics(employees)

// 워크북 생성
const wb = XLSX.utils.book_new()

// 1. 직원 기본정보 시트 (첫 번째 시트)
const employeeSheet = XLSX.utils.json_to_sheet(excelData)

// 컬럼 너비 자동 조정
const columnWidths = [
  { wch: 10 }, // 사번
  { wch: 10 }, // 이름
  { wch: 15 }, // 부서
  { wch: 12 }, // 직군
  { wch: 8 },  // 직급
  { wch: 8 },  // 직책
  { wch: 12 }, // 입사일
  { wch: 15 }, // 현재연봉
  { wch: 10 }, // 평가등급
]
employeeSheet['!cols'] = columnWidths

XLSX.utils.book_append_sheet(wb, employeeSheet, '직원기본정보')

// 2. C사데이터 시트 (직군별 직급별 평균 급여 데이터)
// 실제 데이터에서 직군별 평균 계산
const bands = Array.from(new Set(employees.map(e => e.band).filter(Boolean)))
const cCompanyData = bands.map(band => {
  const bandEmployees = employees.filter(e => e.band === band)
  const levelData: any = { '직군': band }
  
  const levels = ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4']
  levels.forEach(level => {
    const levelEmployees = bandEmployees.filter(e => e.level === level)
    if (levelEmployees.length > 0) {
      const avgSalary = levelEmployees.reduce((sum, e) => sum + e.currentSalary, 0) / levelEmployees.length
      // C사는 우리 회사 대비 95~105% 수준으로 가정
      const randomFactor = 0.95 + Math.random() * 0.1
      levelData[level] = Math.round((avgSalary * randomFactor) / 1000) // 천원 단위
    } else {
      levelData[level] = null
    }
  })
  
  return levelData
})

const cCompanySheet = XLSX.utils.json_to_sheet(cCompanyData)
cCompanySheet['!cols'] = [
  { wch: 15 }, // 직군
  { wch: 12 }, // Lv.1
  { wch: 12 }, // Lv.2
  { wch: 12 }, // Lv.3
  { wch: 12 }, // Lv.4
]
XLSX.utils.book_append_sheet(wb, cCompanySheet, 'C사데이터')

// 3. AI설정 시트
const aiSettingsData = [
  {
    '항목': 'Base-up(%)',
    '값': 3.2,
    '설명': 'AI 제안 기본 인상률'
  },
  {
    '항목': '성과인상률(%)',
    '값': 2.5,
    '설명': 'AI 제안 성과 인상률'
  },
  {
    '항목': '총인상률(%)',
    '값': 5.7,
    '설명': 'AI 제안 총 인상률'
  }
]

const aiSettingsSheet = XLSX.utils.json_to_sheet(aiSettingsData)
aiSettingsSheet['!cols'] = [
  { wch: 20 }, // 항목
  { wch: 10 }, // 값
  { wch: 30 }  // 설명
]
XLSX.utils.book_append_sheet(wb, aiSettingsSheet, 'AI설정')

// 4. C사 인상률 시트
const competitorIncreaseData = [
  { '항목': 'C사 인상률(%)', '값': 4.2, '설명': 'C사 전년 대비 평균 인상률' }
]

const competitorIncreaseSheet = XLSX.utils.json_to_sheet(competitorIncreaseData)
competitorIncreaseSheet['!cols'] = [
  { wch: 25 }, // 항목
  { wch: 10 }, // 값
  { wch: 35 }  // 설명
]
XLSX.utils.book_append_sheet(wb, competitorIncreaseSheet, 'C사인상률')

// 파일 저장
const outputDir = path.join(process.cwd(), 'public', 'data')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const outputPath = path.join(outputDir, 'default_employee_data.xlsx')
XLSX.writeFile(wb, outputPath)

console.log('✅ 기본 엑셀 파일 생성 완료!')
console.log(`📁 파일 위치: ${outputPath}`)
console.log(`📊 총 직원 수: ${employees.length}명`)
console.log(`📋 시트: 직원기본정보, C사데이터, AI설정, C사인상률`)