import { memo } from 'react'
import { usePerformance } from 'reactfire'

// All performance metrics are collected automatically by firebase
// The hook is required to load the lib and initializing it

export default memo(() => {
  const performance = usePerformance()

  console.log({ performance })

  return null
})
