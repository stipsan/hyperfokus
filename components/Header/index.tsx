import cx from 'classnames'
import Button from 'components/Button'

import Link from 'next/link'

import styles from './index.module.css'

type Props = {
  left?: React.ReactNode
  title?: React.ReactNode
  right?: React.ReactNode
}

export default ({
  left = (
    <Link href="/">
      <Button variant="default">Back</Button>
    </Link>
  ),
  title,
  right,
}: Props) => {
  const navSideClassNames = 'flex items-center w-full'
  return (
    <header
      className={cx(
        styles.navbar,
        'flex items-center flex-shrink-0 px-2 top-0 sticky z-10 bg-white border-b border-black border-opacity-25'
      )}
    >
      <div className={cx(navSideClassNames, 'justify-start')}>{left}</div>
      <div className="flex items-center flex-shrink-0 h-inherit">
        {title ?? 'HyperFokus'}
      </div>
      <div className={cx(navSideClassNames, 'justify-end')}>{right}</div>
    </header>
  )
}
