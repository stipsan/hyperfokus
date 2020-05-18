import cx from 'classnames'

type Props = {
  left?: React.ReactNode
  right: React.ReactNode
  sticky?: boolean
}

export default ({ left, right, sticky }: Props) => (
  <div
    className={cx(
      //styles.safarifix,
      { 'bottom-0 sm:sticky bg-white': sticky },
      'flex items-center justify-between py-3 sm:py-6'
    )}
  >
    <div>{left}</div>
    <div>{right}</div>
  </div>
)
