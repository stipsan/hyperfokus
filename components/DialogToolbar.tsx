import cx from 'classnames'
import styles from './DialogToolbar.module.css'

type Props = {
  left?: React.ReactNode
  right: React.ReactNode
  sticky?: boolean
}

export default ({ left, right, sticky = true }: Props) => (
  <div
    className={cx(
      {
        [styles.safarifix]: sticky,
        [styles.stickyshadowfix]: sticky,
        'bottom-0 sticky bg-white z-50': sticky,
      },
      'flex items-center justify-between py-3 sm:py-6'
    )}
  >
    <div className="mr-4">{left}</div>
    <div className="ml-4 grid grid-flow-col gap-2">{right}</div>
  </div>
)
