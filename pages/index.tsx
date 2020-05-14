import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import Counter from 'components/Counter'
import GetStartedBroadcast from 'components/GetStartedBroadcast'
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
      <GetStartedBroadcast />
      <Header
        left={
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
        }
      />
      <p>Schedules selector</p>
      <p>Schedules container</p>
      <div className="container hero bg-gray-300">
        Hello world! <Counter />
      </div>
    </>
  )
}
