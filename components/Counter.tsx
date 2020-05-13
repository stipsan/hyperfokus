import { useState } from 'react'

const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <>
      <button
        className="btn-blue"
        onClick={() => setCount((count) => count + 1)}
      >
        {count}
      </button>
    </>
  )
}

export default Counter
