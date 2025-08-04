'use client'

import { useState } from 'react'

interface ExportButtonProps {
  type: 'summary' | 'employees' | 'simulation'
  className?: string
}

export function ExportButton({ type, className = '' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    setExporting(true)
    try {
      if (format === 'xlsx') {
        const response = await fetch(`/api/reports/export?type=${type}&format=xlsx`)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wage-report-${type}-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // PDF export는 html2canvas를 사용하여 현재 화면을 캡처
        const { default: html2canvas } = await import('html2canvas')
        const { default: jsPDF } = await import('jspdf')
        
        const element = document.querySelector('main')
        if (element) {
          const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            logging: false,
            useCORS: true,
          })
          
          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
          })
          
          const imgWidth = 297 // A4 landscape width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
          pdf.save(`wage-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`)
        }
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('내보내기에 실패했습니다.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
        disabled={exporting}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        {exporting ? '내보내는 중...' : '내보내기'}
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
        <button
          onClick={() => handleExport('xlsx')}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
          disabled={exporting}
        >
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2 1 1 0 100-2 2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
          </svg>
          Excel 파일 (.xlsx)
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
          disabled={exporting}
        >
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
          </svg>
          PDF 파일
        </button>
      </div>
    </div>
  )
}

// 간단한 버전의 내보내기 버튼
export function SimpleExportButton({ type, className = '' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    setExporting(true)
    setShowMenu(false)
    
    try {
      if (format === 'xlsx') {
        const response = await fetch(`/api/reports/export?type=${type}&format=xlsx`)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wage-report-${type}-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // PDF export
        const { default: html2canvas } = await import('html2canvas')
        const { default: jsPDF } = await import('jspdf')
        
        const element = document.querySelector('main')
        if (element) {
          const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            logging: false,
            useCORS: true,
          })
          
          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
          })
          
          const imgWidth = 297
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
          pdf.save(`wage-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`)
        }
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('내보내기에 실패했습니다.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
        disabled={exporting}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        {exporting ? '내보내는 중...' : '내보내기'}
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
          <button
            onClick={() => handleExport('xlsx')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
            disabled={exporting}
          >
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2 1 1 0 100-2 2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
            </svg>
            Excel 파일 (.xlsx)
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
            disabled={exporting}
          >
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
            </svg>
            PDF 파일
          </button>
        </div>
      )}
    </div>
  )
}