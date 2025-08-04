import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SimulationPage from '@/app/simulation/page'

// Mock fetch
global.fetch = jest.fn()

// Mock the SimulationResults component
jest.mock('@/components/simulation/SimulationResults', () => ({
  SimulationResults: ({ results }: any) => (
    <div data-testid="simulation-results">
      <div>Total Employees: {results.simulation.employeeCount}</div>
      <div>Total Increase: {results.simulation.totalIncrease}%</div>
    </div>
  ),
}))

// Mock the ExportButton
jest.mock('@/components/ExportButton', () => ({
  SimpleExportButton: () => <button>Export</button>,
}))

describe('Wage Simulation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should run simulation with default values', async () => {
    const mockResponse = {
      simulation: {
        employeeCount: 345,
        totalIncrease: 5.7,
        currentTotalSalary: '19575000000',
        newTotalSalary: '20691075000',
        totalIncreaseAmount: '1116075000',
      },
      employees: [],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<SimulationPage />)

    // Check initial state
    expect(screen.getByText('임금 인상 시뮬레이션')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3.2')).toBeInTheDocument() // Base-up
    expect(screen.getByDisplayValue('2.5')).toBeInTheDocument() // Merit

    // Run simulation
    const runButton = screen.getByText('시뮬레이션 실행')
    fireEvent.click(runButton)

    await waitFor(() => {
      expect(screen.getByTestId('simulation-results')).toBeInTheDocument()
    })

    expect(screen.getByText('Total Employees: 345')).toBeInTheDocument()
    expect(screen.getByText('Total Increase: 5.7%')).toBeInTheDocument()
  })

  test('should update total percentage when inputs change', async () => {
    render(<SimulationPage />)

    const baseUpInput = screen.getByLabelText('Base-up (%)')
    const meritInput = screen.getByLabelText('Merit increase (%)')

    // Change values
    fireEvent.change(baseUpInput, { target: { value: '4.0' } })
    fireEvent.change(meritInput, { target: { value: '3.0' } })

    // Check total
    expect(screen.getByText('7.0%')).toBeInTheDocument()
  })

  test('should apply filters when running simulation', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ simulation: {}, employees: [] }),
    })

    render(<SimulationPage />)

    // Select filters
    const levelSelect = screen.getByLabelText('직급')
    const departmentSelect = screen.getByLabelText('부서')

    fireEvent.change(levelSelect, { target: { value: 'Lv.3' } })
    fireEvent.change(departmentSelect, { target: { value: '개발팀' } })

    // Run simulation
    fireEvent.click(screen.getByText('시뮬레이션 실행'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/simulation',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"level":"Lv.3"'),
        })
      )
    })
  })

  test('should show confirmation dialog when applying to all', async () => {
    const mockResponse = {
      simulation: {
        employeeCount: 345,
        totalIncrease: 5.7,
      },
      employees: [],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<SimulationPage />)

    // Run simulation first
    fireEvent.click(screen.getByText('시뮬레이션 실행'))

    await waitFor(() => {
      expect(screen.getByText('전체 적용')).toBeInTheDocument()
    })

    // Click apply all
    fireEvent.click(screen.getByText('전체 적용'))

    // Check confirmation dialog
    expect(screen.getByText('전체 적용 확인')).toBeInTheDocument()
    expect(screen.getByText(/345명의 직원에게/)).toBeInTheDocument()
    expect(screen.getByText(/이 작업은 되돌릴 수 없습니다/)).toBeInTheDocument()
  })

  test('should reset results when clicking reset button', async () => {
    const mockResponse = {
      simulation: { employeeCount: 345, totalIncrease: 5.7 },
      employees: [],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<SimulationPage />)

    // Run simulation
    fireEvent.click(screen.getByText('시뮬레이션 실행'))

    await waitFor(() => {
      expect(screen.getByTestId('simulation-results')).toBeInTheDocument()
    })

    // Reset results
    fireEvent.click(screen.getByText('결과 초기화'))

    expect(screen.queryByTestId('simulation-results')).not.toBeInTheDocument()
  })
})