import { useState, useEffect } from 'react'

interface Metadata {
  departments: string[]
  bands: string[]
  levels: string[]
  ratings: string[]
  statistics?: {
    totalEmployees: number
    departmentCount: number
    levelDistribution: Array<{ level: string; count: number }>
    ratingDistribution: Array<{ rating: string; count: number }>
  }
}

interface UseMetadataReturn extends Metadata {
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// 기본값 (폴백용)
const DEFAULT_METADATA: Metadata = {
  departments: ['생산', '영업', '생산기술', '경영지원', '품질보증', '기획', '구매&물류', 'Facility'],
  bands: ['생산', '영업', '생산기술', '경영지원', '품질보증', '기획', '구매&물류', 'Facility'],
  levels: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.4'],
  ratings: ['S', 'A', 'B', 'C']
}

export function useMetadata(): UseMetadataReturn {
  const [metadata, setMetadata] = useState<Metadata>(DEFAULT_METADATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetadata = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/metadata')
      const result = await response.json()
      
      if (result.success && result.data) {
        setMetadata(result.data)
      } else {
        // 에러 시에도 기본값 사용
        setMetadata(result.data || DEFAULT_METADATA)
        if (!result.success) {
          setError(result.error || 'Failed to fetch metadata')
        }
      }
    } catch (err) {
      console.error('Error fetching metadata:', err)
      setError('Failed to load metadata')
      // 에러 시 기본값 유지
      setMetadata(DEFAULT_METADATA)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetadata()
  }, [])

  return {
    ...metadata,
    loading,
    error,
    refresh: fetchMetadata
  }
}