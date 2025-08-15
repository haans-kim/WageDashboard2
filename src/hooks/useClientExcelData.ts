/**
 * 클라이언트 사이드 엑셀 데이터 관리 훅
 */

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { saveExcelData, loadExcelData, clearExcelData, hasStoredData } from '@/lib/clientStorage'

export interface ClientExcelData {
  employees: any[]
  competitorData: any[]
  aiSettings: {
    baseUpPercentage: number
    meritIncreasePercentage: number
    totalPercentage: number
    minRange: number
    maxRange: number
  }
  fileName: string
  uploadedAt: string
}

export function useClientExcelData() {
  const [data, setData] = useState<ClientExcelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 컴포넌트 마운트 시 저장된 데이터 로드
  useEffect(() => {
    loadStoredData()
  }, [])

  const loadStoredData = async () => {
    try {
      setLoading(true)
      const storedData = await loadExcelData()
      if (storedData) {
        setData({
          employees: storedData.employees,
          competitorData: storedData.competitorData,
          aiSettings: storedData.aiSettings,
          fileName: storedData.fileName,
          uploadedAt: storedData.uploadedAt
        })
      }
    } catch (err) {
      console.error('데이터 로드 실패:', err)
      setError('저장된 데이터를 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const uploadExcel = async (file: File) => {
    try {
      setLoading(true)
      setError(null)

      // 파일 읽기
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      // AI설정 시트 읽기
      let aiSettings = {
        baseUpPercentage: 3.2,
        meritIncreasePercentage: 2.5,
        totalPercentage: 5.7,
        minRange: 5.7,
        maxRange: 5.9
      }
      
      if (workbook.SheetNames.includes('AI설정')) {
        const aiSheet = workbook.Sheets['AI설정']
        const aiData = XLSX.utils.sheet_to_json(aiSheet)
        
        aiSettings = {
          baseUpPercentage: (aiData.find((row: any) => row['항목'] === 'Base-up(%)') as any)?.['값'] || 3.2,
          meritIncreasePercentage: (aiData.find((row: any) => row['항목'] === '성과인상률(%)') as any)?.['값'] || 2.5,
          totalPercentage: (aiData.find((row: any) => row['항목'] === '총인상률(%)') as any)?.['값'] || 5.7,
          minRange: (aiData.find((row: any) => row['항목'] === '최소범위(%)') as any)?.['값'] || 5.7,
          maxRange: (aiData.find((row: any) => row['항목'] === '최대범위(%)') as any)?.['값'] || 5.9
        }
      }
      
      // C사데이터 시트 읽기
      let competitorData: any[] = []
      if (workbook.SheetNames.includes('C사데이터')) {
        const competitorSheet = workbook.Sheets['C사데이터']
        const competitorRawData = XLSX.utils.sheet_to_json(competitorSheet)
        
        competitorRawData.forEach((row: any) => {
          const band = row['직군']
          if (band) {
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
      }
      
      // 직원 데이터 읽기
      const employeeSheetName = workbook.SheetNames.includes('직원기본정보') 
        ? '직원기본정보' 
        : workbook.SheetNames.find(name => name.includes('직원')) || workbook.SheetNames[0]
      
      const worksheet = workbook.Sheets[employeeSheetName]
      const employees = XLSX.utils.sheet_to_json(worksheet)
      
      // 데이터 변환 (필요한 경우)
      const processedEmployees = employees.map((emp: any) => ({
        employeeId: emp['사번'] || emp['employeeId'] || '',
        name: emp['이름'] || emp['name'] || '',
        level: emp['직급'] || emp['level'] || '',
        band: emp['직군'] || emp['band'] || '',
        department: emp['부서'] || emp['department'] || '',
        currentSalary: emp['현재연봉'] || emp['currentSalary'] || 0,
        performanceRating: emp['성과등급'] || emp['performanceRating'] || '',
        hireDate: emp['입사일'] || emp['hireDate'] || '',
        position: emp['직책'] || emp['position'] || ''
      }))
      
      const newData: ClientExcelData = {
        employees: processedEmployees,
        competitorData,
        aiSettings,
        fileName: file.name,
        uploadedAt: new Date().toISOString()
      }
      
      // IndexedDB에 저장
      await saveExcelData(newData)
      
      // 상태 업데이트
      setData(newData)
      
      return { success: true, data: newData }
    } catch (err) {
      console.error('엑셀 업로드 실패:', err)
      setError('엑셀 파일 처리 중 오류가 발생했습니다.')
      return { success: false, error: '파일 처리 실패' }
    } finally {
      setLoading(false)
    }
  }

  const clearData = async () => {
    try {
      await clearExcelData()
      setData(null)
    } catch (err) {
      console.error('데이터 삭제 실패:', err)
      setError('데이터 삭제 중 오류가 발생했습니다.')
    }
  }

  return {
    data,
    loading,
    error,
    uploadExcel,
    clearData,
    hasData: hasStoredData()
  }
}