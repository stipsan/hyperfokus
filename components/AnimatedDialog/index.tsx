import { BottomSheet, BottomSheetProps } from 'react-spring-bottom-sheet'

type Props = {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
  'aria-label': string
} & Pick<BottomSheetProps, 'onSpringStart' | 'footer'>

export default function ReactSpringAnimatedDialog({
  children,
  isOpen,
  onDismiss,
  'aria-label': ariaLabel,
  ...props
}: Props) {
  return (
    <BottomSheet
      {...props}
      aria-label={ariaLabel}
      open={isOpen}
      onDismiss={onDismiss}
      // @TODO temp quickfix for z-index troubles, revisit when rsbs supports tw
      className="relative z-50"
      style={{
        ['--rsbs-max-w' as string]: '640px',
        ['--rsbs-ml' as string]: 'auto',
        ['--rsbs-mr' as string]: 'auto',
      }}
    >
      <div className="px-3">{children}</div>
    </BottomSheet>
  )
}
