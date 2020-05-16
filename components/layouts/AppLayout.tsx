import Header from 'components/Header'
import { Suspense } from 'react'

/**
 * Main app frame includes a header and footer
 */

type Props = {
  children: React.ReactNode
}

export default ({ children }: Props) => {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center text-gray-700 text-xl w-screen loading">
            Loading...
          </div>
        }
      >
        <div className="bg-gray-100 min-h-screen">{children}</div>
      </Suspense>
      <footer />
    </>
  )
}
