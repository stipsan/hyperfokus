import cx from 'classnames'

type Props = {
  title?: React.ReactNode
}

export default ({ title }: Props) => {
  const asideClassNames = 'flex'

  return (
    <header>
      <div className={cx(asideClassNames, ' justify-start')}>Left</div>
      <div>{title ?? 'HyperFokus'}</div>
      <div>Right</div>
    </header>
  )
}
