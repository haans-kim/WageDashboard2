'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExcelUploadButton } from '@/components/ExcelUploadButton'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasData, setHasData] = useState(false)

  // 데이터 존재 여부 확인 (자동 리다이렉트 제거)
  useEffect(() => {
    checkDataAvailability()
  }, [])

  const checkDataAvailability = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        if (data?.summary?.totalEmployees > 0) {
          setHasData(true)
        }
      }
    } catch (error) {
      console.error('Failed to check data availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    // 엑셀 업로드 성공 후 대시보드로 이동
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            인건비 대시보드
          </h1>
          
          <div className="flex flex-col items-center gap-4">
            {hasData ? (
              <>
                <p className="text-gray-600 mb-2">
                  기존 데이터가 있습니다.
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  새 데이터를 업로드하면 기존 데이터가 교체됩니다.
                </p>
              </>
            ) : (
              <p className="text-gray-600 mb-4">
                엑셀 파일을 업로드하여 시작하세요
              </p>
            )}
            
            <ExcelUploadButton 
              onUploadSuccess={handleUploadSuccess}
              className="px-12 py-4 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              label={hasData ? "새 데이터 업로드" : "데이터 업로드"}
            />
            
            {hasData && (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-12 py-4 text-lg font-medium bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors mt-2"
              >
                대시보드로 돌아가기
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}