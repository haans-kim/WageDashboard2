import { render, screen } from '@testing-library/react'
import { LevelPieChart } from '@/components/charts/LevelPieChart'

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }: any) => <div data-testid="pie" data-count={data.length}></div>,
  Cell: () => <div data-testid="cell"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>,
}))

describe('LevelPieChart', () => {
  const mockData = [
    { level: 'Lv.1', employeeCount: 50, averageSalary: 30000000, totalSalary: '1500000000' },
    { level: 'Lv.2', employeeCount: 100, averageSalary: 45000000, totalSalary: '4500000000' },
    { level: 'Lv.3', employeeCount: 150, averageSalary: 65000000, totalSalary: '9750000000' },
    { level: 'Lv.4', employeeCount: 45, averageSalary: 85000000, totalSalary: '3825000000' },
  ]

  test('should render chart components', () => {
    render(<LevelPieChart data={mockData} />)

    expect(screen.getByText('직급별 인원 분포')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pie')).toBeInTheDocument()
  })

  test('should display correct number of data points', () => {
    render(<LevelPieChart data={mockData} />)

    const pie = screen.getByTestId('pie')
    expect(pie).toHaveAttribute('data-count', '4')
  })

  test('should render legend and tooltip', () => {
    render(<LevelPieChart data={mockData} />)

    expect(screen.getByTestId('legend')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  test('should handle empty data', () => {
    render(<LevelPieChart data={[]} />)

    expect(screen.getByText('직급별 인원 분포')).toBeInTheDocument()
    const pie = screen.getByTestId('pie')
    expect(pie).toHaveAttribute('data-count', '0')
  })
})