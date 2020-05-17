import { Suspense } from 'react'

/**
 * Same as MainContainer, except it renders the links that don't fit in the top bar in an aside element
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
      <main className="container mx-auto">{children}</main>
    </Suspense>
  )
}
