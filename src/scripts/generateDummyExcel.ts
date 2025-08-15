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

// 1. AI설정 시트 (가장 먼저 추가)
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
  },
  {
    '항목': '최소범위(%)',
    '값': 5.7,
    '설명': '권장 인상률 최소값'
  },
  {
    '항목': '최대범위(%)',
    '값': 5.9,
    '설명': '권장 인상률 최대값'
  }
]

const aiSettingsSheet = XLSX.utils.json_to_sheet(aiSettingsData)
aiSettingsSheet['!cols'] = [
  { wch: 20 }, // 항목
  { wch: 10 }, // 값
  { wch: 30 }  // 설명
]
XLSX.utils.book_append_sheet(wb, aiSettingsSheet, 'AI설정')

// 2. 직원 기본정보 시트
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

// 3. 직급별기준 시트 (새로 추가)
const levelStandardsData = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1'].map(level => ({
  '직급': level,
  '기준Base-up(%)': 3.2,
  '기준성과인상률(%)': 2.5,
  '설명': `${level} 기본 인상률 설정`
}))

const levelStandardsSheet = XLSX.utils.json_to_sheet(levelStandardsData)
levelStandardsSheet['!cols'] = [
  { wch: 10 }, // 직급
  { wch: 15 }, // 기준Base-up(%)
  { wch: 18 }, // 기준성과인상률(%)
  { wch: 30 }  // 설명
]
XLSX.utils.book_append_sheet(wb, levelStandardsSheet, '직급별기준')

// 4. 직급별 요약 시트
const levelSummaryData = ['Lv.4', 'Lv.3', 'Lv.2', 'Lv.1', '신입'].map(level => {
  const levelEmployees = employees.filter(e => e.level === level)
  const avgSalary = levelEmployees.length > 0
    ? levelEmployees.reduce((sum, e) => sum + e.currentSalary, 0) / levelEmployees.length
    : 0
  
  return {
    '직급': level,
    '인원수': levelEmployees.length,
    '평균연봉': Math.round(avgSalary),
    '최소연봉': levelEmployees.length > 0 ? Math.min(...levelEmployees.map(e => e.currentSalary)) : 0,
    '최대연봉': levelEmployees.length > 0 ? Math.max(...levelEmployees.map(e => e.currentSalary)) : 0,
    '구성비(%)': ((levelEmployees.length / employees.length) * 100).toFixed(1)
  }
})

const levelSheet = XLSX.utils.json_to_sheet(levelSummaryData)
levelSheet['!cols'] = [
  { wch: 10 },
  { wch: 10 },
  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
  { wch: 12 }
]
XLSX.utils.book_append_sheet(wb, levelSheet, '직급별요약')

// 5. 직군별 요약 시트
const bandSummaryData = Object.values(bandStats).map((band: any) => ({
  '직군': band.name,
  '인원수': band.totalHeadcount,
  '평균연봉': Math.round(band.avgSalary),
  'Lv.4인원': band.levels.find((l: any) => l.level === 'Lv.4')?.headcount || 0,
  'Lv.3인원': band.levels.find((l: any) => l.level === 'Lv.3')?.headcount || 0,
  'Lv.2인원': band.levels.find((l: any) => l.level === 'Lv.2')?.headcount || 0,
  'Lv.1인원': band.levels.find((l: any) => l.level === 'Lv.1')?.headcount || 0,
  '신입인원': band.levels.find((l: any) => l.level === '신입')?.headcount || 0,
  '구성비(%)': ((band.totalHeadcount / employees.length) * 100).toFixed(1)
}))

const bandSheet = XLSX.utils.json_to_sheet(bandSummaryData)
bandSheet['!cols'] = [
  { wch: 12 },
  { wch: 10 },
  { wch: 15 },
  { wch: 10 },
  { wch: 10 },
  { wch: 10 },
  { wch: 10 },
  { wch: 10 },
  { wch: 12 }
]
XLSX.utils.book_append_sheet(wb, bandSheet, '직군별요약')

// 6. 부서별 요약 시트 (선택적)
const departmentData = Array.from(
  new Set(employees.map(e => e.department))
).map(dept => {
  const deptEmployees = employees.filter(e => e.department === dept)
  const avgSalary = deptEmployees.reduce((sum, e) => sum + e.currentSalary, 0) / deptEmployees.length
  
  return {
    '부서': dept,
    '직군': deptEmployees[0]?.band || '',
    '인원수': deptEmployees.length,
    '평균연봉': Math.round(avgSalary),
    'Lv.4': deptEmployees.filter(e => e.level === 'Lv.4').length,
    'Lv.3': deptEmployees.filter(e => e.level === 'Lv.3').length,
    'Lv.2': deptEmployees.filter(e => e.level === 'Lv.2').length,
    'Lv.1': deptEmployees.filter(e => e.level === 'Lv.1').length,
    '신입': deptEmployees.filter(e => e.level === '신입').length
  }
}).sort((a, b) => a.부서.localeCompare(b.부서))

const deptSheet = XLSX.utils.json_to_sheet(departmentData)
deptSheet['!cols'] = [
  { wch: 15 },
  { wch: 12 },
  { wch: 10 },
  { wch: 15 },
  { wch: 8 },
  { wch: 8 },
  { wch: 8 },
  { wch: 8 },
  { wch: 8 }
]
XLSX.utils.book_append_sheet(wb, deptSheet, '부서별요약')

// 파일 저장
const outputDir = path.join(process.cwd(), 'public', 'data')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const outputPath = path.join(outputDir, 'default_employee_data.xlsx')
XLSX.writeFile(wb, outputPath)

console.log('✅ 기본 엑셀 파일 생성 완료!')
console.log(`📁 파일 위치: ${outputPath}`)
console.log('\n📊 데이터 요약:')
console.log(`- 총 직원 수: ${employees.length}명`)
console.log(`- 직급별 분포:`)
levelSummaryData.forEach(level => {
  console.log(`  ${level.직급}: ${level.인원수}명 (${level['구성비(%)']}%)`)
})
console.log(`- 직군별 분포:`)
bandSummaryData.forEach(band => {
  console.log(`  ${band.직군}: ${band.인원수}명 (${band['구성비(%)']}%)`)
})

// JSON 파일로도 저장 (개발용)
const jsonPath = path.join(outputDir, 'default_employee_data.json')
fs.writeFileSync(jsonPath, JSON.stringify(employees, null, 2))
console.log(`\n📄 JSON 파일도 생성: ${jsonPath}`)