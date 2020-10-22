import { Suspense } from 'react'

/**
 * Contains the page content in a main element, responsively designed
 */

type Props = {
  children: React.ReactNode
}

const MainContainer = ({ children }: Props) => {
  return (
    <Suspense
      fallback={
        <main className="my-40 text-xl text-blue-900 text-center loading">
          Loading...
        </main>
      }
    >
      <main className="">{children}</main>
    </Suspense>
  )
}

export default MainContainer
