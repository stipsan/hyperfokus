import Link from 'next/link'
import { useSessionValue } from './SessionProvider'

export default () => {
  const session = useSessionValue()

  if (session !== 'demo') {
    return null
  }

  return (
    <div
      className="bg-yellow-100 border-b border-t-4 border-yellow-500 px-4 py-3 shadow-inner shadow-inset text-yellow-900"
      role="alert"
    >
      <p className="font-bold">Demo mode</p>
      <p className="text-sm">
        You can look around and try things out as much as you like.
      </p>
      <Link href="/setup">
        <a className="inline-block text-sm font-bold rounded-full text-yellow-100 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 py-1 px-2 mt-1 focus:outline-none focus:shadow-outline">
          Stop the demo, I'm ready!
        </a>
      </Link>
    </div>
  )
}
