import { Suspense } from 'react'

/**
 * Contains the page content in a main element, responsively designed
 */

type Props = {
  children: React.ReactNode
}

export default ({ children }: Props) => {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen items-center justify-center text-gray-700 text-xl w-screen loading">
          Loading...
        </main>
      }
    >
      <main className="">{children}</main>
    </Suspense>
  )
}
