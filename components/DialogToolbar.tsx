type Props = {
  left?: React.ReactNode
  right: React.ReactNode
}

export default ({ left, right }: Props) => (
  <div className="flex items-center justify-between mt-4">
    <div>{left}</div>
    <div>{right}</div>
  </div>
)
