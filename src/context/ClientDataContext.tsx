/**
 * 클라이언트 데이터 컨텍스트
 * 브라우저에 저장된 엑셀 데이터를 앱 전체에서 사용
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { loadExcelData } from '@/lib/clientStorage'

interface ClientData {
  employees: any[]
  competitorData: any[]
  aiSettings: {
    baseUpPercentage: number
    meritIncreasePercentage: number
    totalPercentage: number
    minRange: number
    maxRange: number
  }
}

interface ClientDataContextType {
  data: ClientData | null
  loading: boolean
  refreshData: () => Promise<void>
}

const ClientDataContext = createContext<ClientDataContextType | null>(null)

export function ClientDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshData = async () => {
    try {
      setLoading(true)
      const storedData = await loadExcelData()
      if (storedData) {
        setData({
          employees: storedData.employees,
          competitorData: storedData.competitorData,
          aiSettings: storedData.aiSettings
        })
      }
    } catch (error) {
      console.error('Failed to load client data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  return (
    <ClientDataContext.Provider value={{ data, loading, refreshData }}>
      {children}
    </ClientDataContext.Provider>
  )
}

export function useClientData() {
  const context = useContext(ClientDataContext)
  if (!context) {
    throw new Error('useClientData must be used within ClientDataProvider')
  }
  return context
}