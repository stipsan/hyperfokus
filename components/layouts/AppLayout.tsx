import Header from 'components/Header'
import { Suspense } from 'react'

/**
 * Main app frame includes a header and footer
 */

type Props = {
  children: React.ReactNode
  title?: string
  createLink?: string
}

const AppLayout = ({ children, title, createLink }: Props) => {
  return (
    <>
      <Header title={title} createLink={createLink} />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center text-gray-700 text-xl w-screen loading">
            Loading...
          </div>
        }
      >
        <div className="">{children}</div>
      </Suspense>
      <footer />
    </>
  )
}

export default AppLayout
