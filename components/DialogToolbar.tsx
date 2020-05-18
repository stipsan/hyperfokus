import cx from 'classnames'

type Props = {
  left?: React.ReactNode
  right: React.ReactNode
}

export default ({ left, right }: Props) => (
  <div
    className={cx(
      //styles.safarifix,
      'flex items-center justify-between bg-white bottom-0 sm:sticky py-3 sm:py-6'
    )}
  >
    <div>{left}</div>
    <div>{right}</div>
  </div>
)
