import { useEffect, useState } from 'react'

export const useReduceMotion = () => {
  const [matches, setMatch] = useState(
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      setMatch(mq.matches)
    }
    mq.addListener(handleChange)
    return () => {
      mq.removeListener(handleChange)
    }
  }, [])
  return matches
}
