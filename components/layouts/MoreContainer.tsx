import { Suspense } from 'react'

/**
 * Same as MainContainer, except it renders the links that don't fit in the top bar in an aside element
 */

type Props = {
  children: React.ReactNode
}

const MoreContainer = ({ children }: Props) => {
  return (
    <Suspense
      fallback={
        <main className="my-40 text-xl text-blue-900 text-center loading">
          Loading...
        </main>
      }
    >
      <main className="container mx-auto">{children}</main>
    </Suspense>
  )
}

export default MoreContainer
