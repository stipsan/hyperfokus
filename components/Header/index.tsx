import cx from 'classnames'

import styles from './index.module.css'

type Props = {
  title?: React.ReactNode
}

export default ({ title }: Props) => {
  return (
    <header className={cx(styles.navbar)}>
      <div className={cx(styles.left, 'justify-start')}>Left</div>
      <div className={cx(styles.center, 'h-inherit')}>
        {title ?? 'HyperFokus'}
      </div>
      <div className={cx(styles.right, 'justify-end')}>
        Right <br />
        Right
      </div>
    </header>
  )
}
