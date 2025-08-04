import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardData } from '@/hooks/useDashboardData'

// Mock fetch
global.fetch = jest.fn()

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should fetch dashboard data successfully', async () => {
    const mockData = {
      aiRecommendation: {
        baseUpPercentage: 3.2,
        meritIncreasePercentage: 2.5,
      },
      budget: {
        totalBudget: '31900000000',
      },
      levelStatistics: [],
      departmentDistribution: [],
      performanceDistribution: [],
      summary: {
        totalEmployees: 345,
        lastUpdated: '2024-01-01T00:00:00Z',
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useDashboardData())

    // Initial state
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
  })

  test('should handle fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('Network error')
  })

  test('should handle API errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('Failed to fetch dashboard data')
  })

  test('should refresh data when refresh is called', async () => {
    const mockData = { summary: { totalEmployees: 345 } }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockData, summary: { totalEmployees: 350 } }),
      })

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data?.summary.totalEmployees).toBe(345)

    // Call refresh
    result.current.refresh()

    await waitFor(() => {
      expect(result.current.data?.summary.totalEmployees).toBe(350)
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})