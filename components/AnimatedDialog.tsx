import { DialogContent, DialogOverlay } from '@reach/dialog'
import { animated, to, useTransition } from 'react-spring'

type Props = {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
  'aria-label': string
}

const isSafari =
  typeof window !== 'undefined'
    ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    : false

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
    from: {
      opacity: 0,
      '--dialog-content-transform': 'translateY(2rem)',
      '--dialog-content-sm-transform': 'scale(0.94)',
    },
    enter: {
      opacity: 1,
      '--dialog-content-transform': 'translateY(0rem)',
      '--dialog-content-sm-transform': 'scale(1)',
    },
    leave: {
      opacity: 0,
      '--dialog-content-transform': 'translateY(4rem)',
      '--dialog-content-sm-transform': 'scale(0.86)',
    },
  })

  return transitions(
    ({ opacity, ...style }, item) =>
      item && (
        <AnimatedDialogOverlay
          // @ts-expect-error
          style={{ opacity }}
          onDismiss={onDismiss}
          allowPinchZoom
        >
          <AnimatedDialogContent
            style={{
              ...style,
              // @ts-expect-error
              '--position-sticky': isSafari
                ? to([opacity], (opacity) =>
                    opacity === 1 ? undefined : 'static'
                  )
                : undefined,
            }}
            aria-label={ariaLabel}
          >
            {children}
          </AnimatedDialogContent>
        </AnimatedDialogOverlay>
      )
  )
}
