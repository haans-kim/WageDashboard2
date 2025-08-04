import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SystemHealthPage from '@/app/system/page'

// Mock fetch
global.fetch = jest.fn()

// Mock process object
Object.defineProperty(global, 'process', {
  value: {
    version: 'v18.0.0',
    platform: 'darwin',
    env: { NODE_ENV: 'test' },
  },
})

describe('System Health Page Integration', () => {
  const mockHealthData = {
    status: 'healthy',
    timestamp: '2024-01-01T00:00:00Z',
    checks: {
      database: {
        connected: true,
        employeeCount: 345,
      },
      dataIntegrity: {
        valid: true,
        errors: [],
      },
      budget: {
        currentYear: 2024,
        totalBudget: '31900000000',
        hasBudget: true,
      },
      apiEndpoints: [
        { name: 'Dashboard API', path: '/api/dashboard', status: 'ok' },
        { name: 'Employees API', path: '/api/employees', status: 'ok' },
      ],
      statistics: {
        levelDistribution: [
          { level: 'Lv.1', _count: 50 },
          { level: 'Lv.2', _count: 100 },
          { level: 'Lv.3', _count: 150 },
          { level: 'Lv.4', _count: 45 },
        ],
        recentCalculations: 25,
      },
    },
    summary: {
      totalChecks: 6,
      passedChecks: 6,
      warnings: 0,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should display health status correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthData,
    })

    render(<SystemHealthPage />)

    await waitFor(() => {
      expect(screen.getByText('시스템 상태')).toBeInTheDocument()
    })

    // Check overall status
    expect(screen.getByText('HEALTHY')).toBeInTheDocument()
    expect(screen.getByText('전체 검사')).toBeInTheDocument()
    expect(screen.getByText('경고')).toBeInTheDocument()

    // Check database status
    expect(screen.getByText('데이터베이스')).toBeInTheDocument()
    expect(screen.getByText('정상')).toBeInTheDocument()
    expect(screen.getByText('345명')).toBeInTheDocument()

    // Check budget info
    expect(screen.getByText('예산 정보')).toBeInTheDocument()
    expect(screen.getByText('2024년')).toBeInTheDocument()
    expect(screen.getByText('319억 원')).toBeInTheDocument()
  })

  test('should display warnings when data integrity issues exist', async () => {
    const warningData = {
      ...mockHealthData,
      status: 'warning',
      checks: {
        ...mockHealthData.checks,
        dataIntegrity: {
          valid: false,
          errors: [
            '10명의 직원이 급여 정보가 없습니다.',
            '중복된 사번이 2개 있습니다.',
          ],
        },
      },
      summary: {
        totalChecks: 6,
        passedChecks: 4,
        warnings: 2,
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => warningData,
    })

    render(<SystemHealthPage />)

    await waitFor(() => {
      expect(screen.getByText('WARNING')).toBeInTheDocument()
    })

    expect(screen.getByText('경고')).toBeInTheDocument()
    expect(screen.getByText(/10명의 직원이 급여 정보가 없습니다/)).toBeInTheDocument()
    expect(screen.getByText(/중복된 사번이 2개 있습니다/)).toBeInTheDocument()
  })

  test('should refresh health status when button clicked', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealthData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockHealthData,
          checks: {
            ...mockHealthData.checks,
            database: { connected: true, employeeCount: 350 },
          },
        }),
      })

    render(<SystemHealthPage />)

    await waitFor(() => {
      expect(screen.getByText('345명')).toBeInTheDocument()
    })

    // Click refresh
    fireEvent.click(screen.getByText('다시 확인'))

    await waitFor(() => {
      expect(screen.getByText('350명')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  test('should display level distribution correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthData,
    })

    render(<SystemHealthPage />)

    await waitFor(() => {
      expect(screen.getByText('직급별 분포')).toBeInTheDocument()
    })

    // Check all levels
    expect(screen.getByText('Lv.1')).toBeInTheDocument()
    expect(screen.getByText('50명')).toBeInTheDocument()
    expect(screen.getByText('Lv.2')).toBeInTheDocument()
    expect(screen.getByText('100명')).toBeInTheDocument()
    expect(screen.getByText('Lv.3')).toBeInTheDocument()
    expect(screen.getByText('150명')).toBeInTheDocument()
    expect(screen.getByText('Lv.4')).toBeInTheDocument()
    expect(screen.getByText('45명')).toBeInTheDocument()
  })

  test('should display API endpoints status', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthData,
    })

    render(<SystemHealthPage />)

    await waitFor(() => {
      expect(screen.getByText('API 엔드포인트 상태')).toBeInTheDocument()
    })

    expect(screen.getByText('Dashboard API')).toBeInTheDocument()
    expect(screen.getByText('Employees API')).toBeInTheDocument()
  })

  test('should display system information', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealthData,
    })

    render(<SystemHealthPage />)

    await waitFor(() => {
      expect(screen.getByText('시스템 정보')).toBeInTheDocument()
    })

    expect(screen.getByText('Node.js 버전')).toBeInTheDocument()
    expect(screen.getByText('v18.0.0')).toBeInTheDocument()
    expect(screen.getByText('환경')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('플랫폼')).toBeInTheDocument()
    expect(screen.getByText('darwin')).toBeInTheDocument()
  })

  test('should handle fetch errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<SystemHealthPage />)

    await waitFor(() => {
      expect(screen.getByText('시스템 상태를 확인할 수 없습니다.')).toBeInTheDocument()
    })
  })
})