import Link from 'next/link'

export default () => (
  <p>
    Is the demo looking good?{' '}
    <Link href="/setup">
      <a>Get started now!</a>
    </Link>
  </p>
)
