/**
 * 기존 SBL_employee_data_comp.xlsx 파일에 C사 인상률 시트 추가
 */

import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

// 파일 경로
const inputPath = path.join(process.cwd(), 'public', 'data', 'SBL_employee_data_comp.xlsx')
const outputPath = path.join(process.cwd(), 'public', 'data', 'SBL_employee_data_comp_updated.xlsx')

// 기존 파일 읽기
console.log('📖 기존 엑셀 파일 읽기:', inputPath)

if (!fs.existsSync(inputPath)) {
  console.error('❌ 파일을 찾을 수 없습니다:', inputPath)
  process.exit(1)
}

const workbook = XLSX.readFile(inputPath)
console.log('📋 기존 시트:', workbook.SheetNames.join(', '))

// C사 인상률 데이터 (단순한 단일 값)
const competitorIncreaseData = [
  { '항목': 'C사 인상률(%)', '값': 4.2, '설명': 'C사 전년 대비 평균 인상률' }
]

// C사인상률 시트 생성
const competitorIncreaseSheet = XLSX.utils.json_to_sheet(competitorIncreaseData)
competitorIncreaseSheet['!cols'] = [
  { wch: 25 }, // 항목
  { wch: 10 }, // 값
  { wch: 35 }  // 설명
]

// 시트 추가 또는 업데이트
if (workbook.SheetNames.includes('C사인상률')) {
  console.log('⚠️  C사인상률 시트가 이미 존재합니다. 업데이트합니다.')
  workbook.Sheets['C사인상률'] = competitorIncreaseSheet
} else {
  console.log('✨ C사인상률 시트를 추가합니다.')
  XLSX.utils.book_append_sheet(workbook, competitorIncreaseSheet, 'C사인상률')
}

// 파일 저장
XLSX.writeFile(workbook, outputPath)
console.log('✅ 업데이트된 파일 저장 완료:', outputPath)
console.log('📋 최종 시트:', workbook.SheetNames.join(', '))

// 원본 파일 백업 후 교체
const backupPath = inputPath.replace('.xlsx', '_backup.xlsx')
console.log('💾 원본 파일 백업:', backupPath)
fs.copyFileSync(inputPath, backupPath)

console.log('🔄 원본 파일 교체')
fs.copyFileSync(outputPath, inputPath)

console.log('✅ 완료! C사 인상률이 추가되었습니다.')