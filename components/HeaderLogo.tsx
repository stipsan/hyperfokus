import cx from 'classnames'
import styles from 'components/HeaderLogo.module.css'
import Logo from 'components/Logo'

// Designed to put the logo in relatively the same position as the header does, when you're not using the header

export default () => (
  <div
    className={cx(
      styles.wrapper,
      'flex items-center px-2 justify-center sm:justify-start'
    )}
  >
    <Logo />
  </div>
)
