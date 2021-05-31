import Link from 'next/link'
import Button from 'components/Button'
import { AuthCheck } from 'reactfire'

// TODO handle the login right here, and offer button to disable firebase (and fallback to localstorage rather)

export default function FirebaseAuthCheck({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck
      fallback={
        <>
          <Link href="/settings">
            <Button className="block mx-auto mt-32" variant="primary">
              Login
            </Button>
          </Link>
        </>
      }
    >
      {children}
    </AuthCheck>
  )
}
