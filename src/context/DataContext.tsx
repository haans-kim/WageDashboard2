'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface DataContextType {
  uploadedData: any | null
  setUploadedData: (data: any) => void
  clearUploadedData: () => void
  hasUploadedData: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [uploadedData, setUploadedData] = useState<any | null>(null)

  const clearUploadedData = useCallback(() => {
    setUploadedData(null)
  }, [])

  const value = {
    uploadedData,
    setUploadedData,
    clearUploadedData,
    hasUploadedData: !!uploadedData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}