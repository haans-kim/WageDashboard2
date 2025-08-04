/**
 * 숫자를 한국식 통화 형식으로 포맷팅
 * @param value - 포맷할 숫자
 * @param unit - 단위 ('원', '만원', '억원')
 * @returns 포맷된 문자열
 */
export function formatKoreanCurrency(value: number, unit: '원' | '만원' | '억원' = '원'): string {
  if (unit === '억원') {
    const billions = (value / 100000000).toFixed(0)
    return `${billions.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}억 원`
  }
  
  if (unit === '만원') {
    const tenThousands = (value / 10000).toFixed(0)
    return `${tenThousands.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}만 원`
  }
  
  return `${value.toLocaleString('ko-KR')}원`
}

/**
 * 퍼센트 포맷팅
 * @param value - 퍼센트 값
 * @param decimals - 소수점 자리수
 * @returns 포맷된 문자열
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * 직급을 숫자로 변환
 * @param level - 직급 레벨
 * @returns 숫자 값
 */
export function levelToNumber(level: string): number {
  const match = level.match(/Lv\.(\d+)/)
  return match ? parseInt(match[1]) : 0
}

/**
 * 인상액 계산
 * @param salary - 현재 급여
 * @param percentage - 인상률
 * @returns 인상액
 */
export function calculateIncreaseAmount(salary: number, percentage: number): number {
  return Math.round(salary * (percentage / 100))
}