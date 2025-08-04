export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">인건비 대시보드</h1>
          <p className="text-gray-600 mt-2">실시간 인상률 조정 및 인건비 배분 최적화</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI 제안 적정 인상률 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">AI 제안 적정 인상률</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 인원</span>
                <span className="font-semibold font-tabular">4,925명</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">최적 인상률</p>
                  <p className="text-3xl font-bold text-blue-600 font-tabular">5.7%</p>
                  <p className="text-xs text-gray-500 mt-1">Range 5.7%~5.9%</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Base-up</span>
                  <span className="font-semibold font-tabular">3.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Merit increase</span>
                  <span className="font-semibold font-tabular">2.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 인상 재원 예산 현황 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">인상 재원 예산 현황</h2>
            <div className="space-y-4">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span>총 예산</span>
                  <span className="text-2xl font-bold font-tabular">319억 원</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">사용 예산</span>
                  <span className="font-semibold font-tabular">189억 원</span>
                </div>
                <div className="mt-3">
                  <div className="bg-primary-200 rounded-full h-2">
                    <div className="bg-primary-600 rounded-full h-2 w-[79%]"></div>
                  </div>
                  <p className="text-right text-sm font-semibold mt-1 text-primary-600">79% 활용</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>개발 진행 중입니다...</p>
        </div>
      </div>
    </main>
  )
}