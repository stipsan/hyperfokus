import cx from 'classnames'
import Logo from 'components/Logo'
import styles from './HeaderLogo.module.css'

const HeaderLogo = () => (
  <div
    className={cx(styles.wrapper, 'flex items-center px-inset justify-start')}
  >
    <Logo />
  </div>
)

// Designed to put the logo in relatively the same position as the header does, when you're not using the header

export default HeaderLogo
