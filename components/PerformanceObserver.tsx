import { memo } from 'react'
import { usePerformance } from 'reactfire'

// All performance metrics are collected automatically by firebase
// The hook is required to load the lib and initializing it

const PerformanceObserver = memo(() => {
  usePerformance()

  return null
})

export default PerformanceObserver
