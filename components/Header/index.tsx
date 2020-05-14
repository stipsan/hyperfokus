import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import cx from 'classnames'
import Link from 'next/link'
import { forwardRef } from 'react'

import styles from './index.module.css'

const NavLink: React.FC<{ href: string }> = forwardRef(
  ({ children, href, ...props }, ref: React.Ref<HTMLAnchorElement>) => (
    <Link href={href}>
      <a {...props} ref={ref}>
        {children}
      </a>
    </Link>
  )
)

const DefaultMenu: React.FC = () => {
  return (
    <Menu>
      <MenuButton className="btn-blue my-1">Menu</MenuButton>
      <MenuList>
        <MenuLink as={NavLink} href="/activities">
          Completed Activities
        </MenuLink>
        <MenuLink as={NavLink} href="/settings">
          Settings
        </MenuLink>
        <MenuLink as={NavLink} href="/help">
          Help
        </MenuLink>
      </MenuList>
    </Menu>
  )
}

type Props = {
  left?: React.ReactNode
  title?: React.ReactNode
}

export default ({ left = <DefaultMenu />, title }: Props) => {
  const navSideClassNames = 'flex items-center w-full'
  return (
    <header
      className={cx(
        styles.navbar,
        'flex items-center flex-shrink-0 px-2 top-0 sticky z-10 bg-white border-b border-black border-opacity-25'
      )}
    >
      <div className={cx(navSideClassNames, 'justify-start')}>{left}</div>
      <div className="flex items-center flex-shrink-0 h-inherit">
        {title ?? 'HyperFokus'}
      </div>
      <div className={cx(navSideClassNames, 'justify-end')}>Right</div>
    </header>
  )
}
