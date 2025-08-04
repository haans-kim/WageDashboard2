export interface WageIncreaseCalculation {
  totalPercentage: number
  newSalary: number
  increaseAmount: number
}

export function calculateWageIncrease({
  currentSalary,
  baseUpPercentage,
  meritIncreasePercentage,
}: {
  currentSalary: number
  baseUpPercentage: number
  meritIncreasePercentage: number
}): WageIncreaseCalculation {
  const totalPercentage = baseUpPercentage + meritIncreasePercentage
  const newSalary = Math.round(currentSalary * (1 + totalPercentage / 100))
  const increaseAmount = newSalary - currentSalary

  return {
    totalPercentage,
    newSalary,
    increaseAmount,
  }
}

export interface BudgetCalculation {
  currentTotal: number
  newTotal: number
  difference: number
  percentageIncrease: number
}

export function calculateTotalBudget(
  employees: Array<{
    id: string
    currentSalary: number
    suggestedSalary: number
  }>
): BudgetCalculation {
  const currentTotal = employees.reduce((sum, emp) => sum + emp.currentSalary, 0)
  const newTotal = employees.reduce((sum, emp) => sum + emp.suggestedSalary, 0)
  const difference = newTotal - currentTotal
  const percentageIncrease = currentTotal > 0 ? (difference / currentTotal) * 100 : 0

  return {
    currentTotal,
    newTotal,
    difference,
    percentageIncrease,
  }
}