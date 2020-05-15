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
      <Suspense fallback="Loading...">
        <main>{children}</main>
      </Suspense>
    </>
  )
}
