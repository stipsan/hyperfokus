import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import { className } from 'components/Button'
import Counter from 'components/Counter'
import Header from 'components/Header'
import Link from 'next/link'
import { forwardRef } from 'react'

const NavLink: React.FC<{ href: string }> = forwardRef(
  ({ children, href, ...props }, ref: React.Ref<HTMLAnchorElement>) => (
    <Link href={href}>
      <a {...props} ref={ref}>
        {children}
      </a>
    </Link>
  )
)
export default () => {
  return (
    <>
      <Header
        left={
          <Menu>
            <MenuButton className={className({ variant: 'primary' })}>
              Menu
            </MenuButton>
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
        }
      />
      <p>Schedules selector</p>
      <p>Schedules container</p>
      <div className="hero bg-gray-300">Hello world!</div>
    </>
  )
}
