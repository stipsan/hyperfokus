import cx from 'classnames'

import styles from './index.module.css'

type Props = {
  title?: React.ReactNode
}

export default ({ title }: Props) => {
  const navSideClassNames = 'flex items-center w-full'
  return (
    <header
      className={cx(
        styles.navbar,
        'flex items-center flex-shrink-0 px-2 top-0 sticky z-10 bg-white border-b border-black border-opacity-25'
      )}
    >
      <div className={cx(navSideClassNames, 'justify-start')}>Left</div>
      <div className="flex items-center flex-shrink-0 h-inherit">
        {title ?? 'HyperFokus'}
      </div>
      <div className={cx(navSideClassNames, 'justify-end')}>
        Right <br />
        Right
      </div>
    </header>
  )
}
