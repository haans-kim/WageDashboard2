'use client'

interface LevelPerformanceHeatmapProps {
  data: Array<{
    level: string
    S: number
    A: number
    B: number
    C: number
  }>
}

export function LevelPerformanceHeatmap({ data }: LevelPerformanceHeatmapProps) {
  const ratings = ['S', 'A', 'B', 'C']
  
  // 색상 강도 계산 (0-100 범위)
  const getColorIntensity = (value: number, max: number) => {
    return Math.round((value / max) * 100)
  }
  
  // 전체 최대값 찾기
  const maxValue = Math.max(
    ...data.flatMap(row => ratings.map(rating => row[rating as keyof typeof row] as number))
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">직급×평가등급 분포 히트맵</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">직급</th>
              {ratings.map(rating => (
                <th key={rating} className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                  {rating}등급
                </th>
              ))}
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">합계</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const total = ratings.reduce((sum, rating) => 
                sum + (row[rating as keyof typeof row] as number), 0
              )
              
              return (
                <tr key={row.level} className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.level}</td>
                  {ratings.map(rating => {
                    const value = row[rating as keyof typeof row] as number
                    const intensity = getColorIntensity(value, maxValue)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
                    
                    return (
                      <td key={rating} className="px-4 py-3 text-center">
                        <div
                          className="relative px-2 py-1 rounded text-white font-medium"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                            color: intensity > 50 ? 'white' : 'black'
                          }}
                        >
                          <div className="text-sm font-bold">{value}명</div>
                          <div className="text-xs opacity-80">{percentage}%</div>
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-center font-bold text-gray-900">
                    {total}명
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="border-t-2">
            <tr>
              <td className="px-4 py-3 font-bold text-gray-900">합계</td>
              {ratings.map(rating => {
                const total = data.reduce((sum, row) => 
                  sum + (row[rating as keyof typeof row] as number), 0
                )
                return (
                  <td key={rating} className="px-4 py-3 text-center font-bold text-gray-900">
                    {total}명
                  </td>
                )
              })}
              <td className="px-4 py-3 text-center font-bold text-gray-900">
                {data.reduce((sum, row) => 
                  sum + ratings.reduce((s, r) => s + (row[r as keyof typeof row] as number), 0), 0
                )}명
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* 범례 */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">낮음</span>
        <div className="flex h-6">
          {[10, 30, 50, 70, 90].map(intensity => (
            <div
              key={intensity}
              className="w-8 h-full"
              style={{ backgroundColor: `rgba(59, 130, 246, ${intensity / 100})` }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">높음</span>
      </div>
    </div>
  )
}