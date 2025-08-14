'use client'

import { useState, useRef, useEffect } from 'react'

interface ExcelUploadButtonProps {
  onUploadSuccess?: () => void
  isNavigation?: boolean
}

export function ExcelUploadButton({ onUploadSuccess, isNavigation = false }: ExcelUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [loadedFileName, setLoadedFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 초기 로드 시 localStorage에서 파일명 가져오기
  useEffect(() => {
    const savedFileName = localStorage.getItem('loadedExcelFile')
    setLoadedFileName(savedFileName || 'default_employee_data.xlsx')
  }, [])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 형식 검증
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus({
        type: 'error',
        message: '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.'
      })
      return
    }

    setIsUploading(true)
    setUploadStatus({ type: null, message: '' })

    try {
      // Use API route instead of direct service call
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success) {
        setUploadStatus({
          type: 'success',
          message: result.message
        })
        
        // 파일명 저장 (localStorage에도 저장)
        setLoadedFileName(file.name)
        localStorage.setItem('loadedExcelFile', file.name)
        
        // 성공 시 콜백 실행 (페이지 새로고침 등)
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess()
          }, 1500)
        } else {
          // onUploadSuccess가 없으면 페이지 강제 새로고침
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } else {
        setUploadStatus({
          type: 'error',
          message: result.message
        })
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: '파일 업로드 중 오류가 발생했습니다.'
      })
    } finally {
      setIsUploading(false)
      // 같은 파일 재선택 가능하도록 값 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const buttonClass = isNavigation 
    ? `h-8 md:h-9 px-2 md:px-4 text-xs md:text-sm font-medium ${
        isUploading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600'
      } text-white rounded-md transition-colors shadow-sm flex items-center gap-1 md:gap-2 w-full md:w-auto justify-center`
    : `h-8 md:h-10 px-3 md:px-4 text-xs md:text-sm font-medium ${
        isUploading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600'
      } text-white rounded-md transition-colors shadow-sm flex items-center gap-1 md:gap-2`
  
  return (
    <div className="flex items-center gap-2">
      {/* 현재 로드된 파일명 표시 */}
      {loadedFileName && (
        <div className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-md text-sm text-gray-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="max-w-[150px] truncate" title={loadedFileName}>
            {loadedFileName}
          </span>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className={buttonClass}
      >
        {isUploading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            업로드 중...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Excel 업로드
          </>
        )}
      </button>

      {/* 상태 메시지 표시 */}
      {uploadStatus.type && (
        <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {uploadStatus.type === 'success' ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{uploadStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}