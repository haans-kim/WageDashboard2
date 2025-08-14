'use client'

import { useState } from 'react'
import { ExportData } from '@/lib/exportHelpers'

interface ExportButtonProps {
  exportData?: ExportData
  scenarioName?: string
  className?: string
}

export function ExportButton({ exportData, scenarioName, className = '' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!exportData) {
      alert('내보낼 데이터가 없습니다.')
      return
    }

    setExporting(true)
    try {
      // POST 요청으로 데이터 전송
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: exportData,
          format: 'xlsx'
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wage-dashboard-${scenarioName || 'export'}-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // 성공 알림
      alert('Excel 파일이 다운로드되었습니다.')
    } catch (error) {
      console.error('Export failed:', error)
      alert(`내보내기에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      className={`px-5 py-2.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium ${className}`}
      disabled={exporting || !exportData}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      {exporting ? '내보내는 중...' : 'Excel 내보내기'}
    </button>
  )
}

// SimpleExportButton을 ExportButton으로 통합
export const SimpleExportButton = ExportButton