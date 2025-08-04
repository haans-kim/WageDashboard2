'use client'

import { useState, useEffect } from 'react'

interface HealthCheck {
  status: 'healthy' | 'warning' | 'error'
  timestamp: string
  checks: {
    database: {
      connected: boolean
      employeeCount: number
    }
    dataIntegrity: {
      valid: boolean
      errors: string[]
    }
    budget: {
      currentYear: number
      totalBudget: string
      hasBudget: boolean
    }
    apiEndpoints: Array<{
      name: string
      path: string
      status: string
    }>
    statistics: {
      levelDistribution: Array<{
        level: string
        _count: number
      }>
      recentCalculations: number
    }
  }
  summary: {
    totalChecks: number
    passedChecks: number
    warnings: number
  }
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
      setLastChecked(new Date())
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: boolean | string) => {
    if (status === true || status === 'ok' || status === 'healthy') {
      return '✅'
    } else if (status === 'warning') {
      return '⚠️'
    } else {
      return '❌'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow h-96"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!health) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-red-600">시스템 상태를 확인할 수 없습니다.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">시스템 상태</h1>
            <p className="text-gray-600 mt-2">시스템 건강 상태 및 데이터 무결성 확인</p>
          </div>
          <button
            onClick={fetchHealth}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            다시 확인
          </button>
        </header>

        {/* 전체 상태 요약 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">전체 상태</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(health.status)}`}>
              {health.status.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{health.summary.totalChecks}</p>
              <p className="text-sm text-gray-600">전체 검사</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{health.summary.passedChecks}</p>
              <p className="text-sm text-gray-600">통과</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{health.summary.warnings}</p>
              <p className="text-sm text-gray-600">경고</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            마지막 확인: {lastChecked.toLocaleString('ko-KR')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 데이터베이스 상태 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {getStatusIcon(health.checks.database.connected)} 데이터베이스
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">연결 상태</span>
                <span className="font-semibold">
                  {health.checks.database.connected ? '정상' : '오류'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 직원 수</span>
                <span className="font-semibold">{health.checks.database.employeeCount}명</span>
              </div>
            </div>
          </div>

          {/* 데이터 무결성 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {getStatusIcon(health.checks.dataIntegrity.valid)} 데이터 무결성
            </h3>
            {health.checks.dataIntegrity.valid ? (
              <p className="text-green-600">모든 데이터가 정상입니다.</p>
            ) : (
              <div className="space-y-2">
                {health.checks.dataIntegrity.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">• {error}</p>
                ))}
              </div>
            )}
          </div>

          {/* 예산 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {getStatusIcon(health.checks.budget.hasBudget)} 예산 정보
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">회계연도</span>
                <span className="font-semibold">{health.checks.budget.currentYear}년</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 예산</span>
                <span className="font-semibold">
                  {health.checks.budget.hasBudget 
                    ? `${(Number(health.checks.budget.totalBudget) / 100000000).toFixed(0)}억 원`
                    : '설정 없음'}
                </span>
              </div>
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">통계 정보</h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">직급별 분포</p>
              {health.checks.statistics.levelDistribution.map(level => (
                <div key={level.level} className="flex justify-between text-sm">
                  <span className="text-gray-600">{level.level}</span>
                  <span>{level._count}명</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">최근 30일 계산</span>
                  <span className="font-semibold">{health.checks.statistics.recentCalculations}건</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API 엔드포인트 상태 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">API 엔드포인트 상태</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {health.checks.apiEndpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium">{endpoint.name}</span>
                <span className="text-sm">{getStatusIcon(endpoint.status)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">시스템 정보</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Node.js 버전</p>
              <p className="font-semibold">{process.version}</p>
            </div>
            <div>
              <p className="text-gray-600">환경</p>
              <p className="font-semibold">{process.env.NODE_ENV || 'development'}</p>
            </div>
            <div>
              <p className="text-gray-600">플랫폼</p>
              <p className="font-semibold">{process.platform}</p>
            </div>
            <div>
              <p className="text-gray-600">타임스탬프</p>
              <p className="font-semibold">{new Date(health.timestamp).toLocaleTimeString('ko-KR')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}