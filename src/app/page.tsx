'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import { AIRecommendationCard } from '@/components/dashboard/AIRecommendationCard'
import { BudgetCard } from '@/components/dashboard/BudgetCard'
import { LevelDistributionCard } from '@/components/dashboard/LevelDistributionCard'

export default function Home() {
  const { data, loading, error, refresh } = useDashboardData()

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow h-96"></div>
              <div className="bg-white rounded-lg shadow h-96"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다: {error}</p>
            <button 
              onClick={refresh}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">인건비 대시보드</h1>
            <p className="text-gray-600 mt-2">실시간 인상률 조정 및 인건비 배분 최적화</p>
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            새로고침
          </button>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIRecommendationCard 
            data={data?.aiRecommendation || null} 
            totalEmployees={data?.summary.totalEmployees || 0}
          />
          <BudgetCard data={data?.budget || null} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LevelDistributionCard data={data?.levelStatistics || []} />
          
          {/* 부서별 분포 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">부서별 직원 분포</h2>
            <div className="space-y-3">
              {data?.departmentDistribution.map(dept => {
                const percentage = data.summary.totalEmployees > 0 
                  ? (dept.count / data.summary.totalEmployees) * 100 
                  : 0
                return (
                  <div key={dept.department} className="flex items-center justify-between">
                    <span className="text-gray-700">{dept.department}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{dept.count}명</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>마지막 업데이트: {data ? new Date(data.summary.lastUpdated).toLocaleString('ko-KR') : '-'}</p>
        </div>
      </div>
    </main>
  )
}