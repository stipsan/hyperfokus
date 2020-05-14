import cx from 'classnames'

import styles from './index.module.css'

type Props = {
  title?: React.ReactNode
}

export default ({ title }: Props) => {
  const asideClassNames = 'flex'

  return (
    <header className={styles.navbar}>
      <div className={cx(asideClassNames, 'justify-start')}>Left</div>
      <div>{title ?? 'HyperFokus'}</div>
      <div className={cx(asideClassNames, 'justify-end')}>
        Right <br />
        Right
      </div>
    </header>
  )
}
