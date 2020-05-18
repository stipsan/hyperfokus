import { DialogContent, DialogOverlay } from '@reach/dialog'
import { animated, useTransition } from 'react-spring'

type Props = {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
  'aria-label': string
}

export default ({
  children,
  isOpen,
  onDismiss,
  'aria-label': ariaLabel,
}: Props) => {
  const AnimatedDialogOverlay = animated(DialogOverlay)
  const AnimatedDialogContent = animated(DialogContent)

  const transitions = useTransition(isOpen, {
    config: { duration: 150 },
    from: { opacity: 0, scale: 0.94 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.86 },
  })

  return transitions(
    ({ opacity, scale }, item) =>
      item && (
        <AnimatedDialogOverlay
          style={{ opacity }}
          onDismiss={onDismiss}
          allowPinchZoom
        >
          <AnimatedDialogContent style={{ scale }} aria-label={ariaLabel}>
            {children}
          </AnimatedDialogContent>
        </AnimatedDialogOverlay>
      )
  )
}
