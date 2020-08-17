import { DialogContent, DialogOverlay } from '@reach/dialog'
import { Component, lazy } from 'react'

const AnimatedDialog = lazy(() =>
  import('./ReactSpring').then((module) => {
    console.warn('Remove AnimatedDialog workaround!')
    return module
  })
)

// @TODO remove workaround when react-spring works in production again with webpack v5

export type Props = {
  children: React.ReactNode
  isOpen: boolean
  onDismiss: () => void
  'aria-label': string
}

export default class AnimatedDialogFailSafe extends Component<Props> {
  state = { fallback: false }

  static getDerivedStateFromError() {
    return { fallback: true }
  }

  componentDidCatch() {}

  render() {
    if (this.state.fallback) {
      return (
        this.props.isOpen && (
          <DialogOverlay onDismiss={this.props.onDismiss} allowPinchZoom>
            <DialogContent aria-label={this.props['aria-label']}>
              {this.props.children}
            </DialogContent>
          </DialogOverlay>
        )
      )
    }

    return <AnimatedDialog {...this.props} />
  }
}
