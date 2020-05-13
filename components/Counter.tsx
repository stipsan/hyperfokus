import { useState } from 'react'

const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <h1>
      {count} -{' '}
      <button onClick={() => setCount((count) => count + 1)}>+1</button>
    </h1>
  )
}

export default Counter
