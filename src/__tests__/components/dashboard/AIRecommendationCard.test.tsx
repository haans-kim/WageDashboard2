import { render, screen } from '@testing-library/react'
import { AIRecommendationCard } from '@/components/dashboard/AIRecommendationCard'

describe('AIRecommendationCard', () => {
  const mockData = {
    baseUpPercentage: 3.2,
    meritIncreasePercentage: 2.5,
    totalIncrease: 5.7,
    explanation: '시장 경쟁력 유지를 위한 적정 인상률입니다.',
    status: 'approved' as const,
    createdAt: '2024-01-01T00:00:00Z',
  }

  test('should render recommendation data correctly', () => {
    render(<AIRecommendationCard data={mockData} totalEmployees={345} />)

    expect(screen.getByText('AI 추천 인상률')).toBeInTheDocument()
    expect(screen.getByText('3.2%')).toBeInTheDocument()
    expect(screen.getByText('2.5%')).toBeInTheDocument()
    expect(screen.getByText('5.7%')).toBeInTheDocument()
    expect(screen.getByText(/시장 경쟁력/)).toBeInTheDocument()
  })

  test('should show approved status correctly', () => {
    render(<AIRecommendationCard data={mockData} totalEmployees={345} />)
    
    expect(screen.getByText('승인됨')).toBeInTheDocument()
    expect(screen.getByText('승인됨')).toHaveClass('bg-green-100', 'text-green-800')
  })

  test('should show pending status correctly', () => {
    const pendingData = { ...mockData, status: 'pending' as const }
    render(<AIRecommendationCard data={pendingData} totalEmployees={345} />)
    
    expect(screen.getByText('검토중')).toBeInTheDocument()
    expect(screen.getByText('검토중')).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  test('should display total employees count', () => {
    render(<AIRecommendationCard data={mockData} totalEmployees={345} />)
    
    expect(screen.getByText('345명')).toBeInTheDocument()
    expect(screen.getByText('적용 대상')).toBeInTheDocument()
  })

  test('should handle null data gracefully', () => {
    render(<AIRecommendationCard data={null} totalEmployees={0} />)
    
    expect(screen.getByText('AI 추천 인상률')).toBeInTheDocument()
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument()
  })
})