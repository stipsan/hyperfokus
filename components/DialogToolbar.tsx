type Props = {
  left?: React.ReactNode
  right: React.ReactNode
}

export default ({ left, right }: Props) => (
  <div className="flex items-center justify-between sticky bg-white bottom-0 py-3 sm:py-6">
    <div>{left}</div>
    <div>{right}</div>
  </div>
)
