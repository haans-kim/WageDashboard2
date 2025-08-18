/**
 * 하이브리드 데이터 훅
 * 클라이언트 데이터가 있으면 사용, 없으면 서버 데이터 사용
 */

import { useState, useEffect } from 'react'
import { loadExcelData, hasStoredData } from '@/lib/clientStorage'

export function useHybridData() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isClientData, setIsClientData] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 먼저 클라이언트 데이터 확인
      if (hasStoredData()) {
        const clientData = await loadExcelData()
        if (clientData) {
          setData(clientData)
          setIsClientData(true)
          setLoading(false)
          return
        }
      }

      // 클라이언트 데이터가 없으면 서버 데이터 사용
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const serverData = await response.json()
        setData(serverData)
        setIsClientData(false)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    isClientData,
    refreshData: loadData
  }
}