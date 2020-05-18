import cx from 'classnames'
import Logo from 'components/Logo'
import styles from './HeaderLogo.module.css'

// Designed to put the logo in relatively the same position as the header does, when you're not using the header

export default () => (
  <div
    className={cx(
      styles.wrapper,
      'flex items-center px-inset justify-center sm:justify-start'
    )}
  >
    <Logo />
  </div>
)
