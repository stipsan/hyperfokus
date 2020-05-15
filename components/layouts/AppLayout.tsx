import { Suspense } from 'react'
import Header from 'components/Header'

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
          <main className="flex h-screen items-center justify-center text-gray-700 text-xl w-screen loading">
            Loading...
          </main>
        }
      >
        <main>{children}</main>
      </Suspense>
      <footer />
    </>
  )
}
