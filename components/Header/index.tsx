import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import cx from 'classnames'
import { className } from 'components/Button'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef } from 'react'

import styles from './index.module.css'

type Props = {
  left?: React.ReactNode
  title?: React.ReactNode
  right?: React.ReactNode
}

const NavLink: React.FC<{ href: string }> = forwardRef(
  ({ children, href, ...props }, ref: React.Ref<HTMLAnchorElement>) => (
    <Link href={href}>
      <a {...props} ref={ref}>
        {children}
      </a>
    </Link>
  )
)

const topLinks = [
  ['Todos', '/'],
  ['Schedules', '/schedules'],
]
export const moreLinks = [
  ['Settings', '/settings'],
  ['Completed Activities', '/done'],
  ['Help', '/help'],
]

const TopLink: React.FC<{ className?: string; href: string }> = ({
  href,
  children,
  className,
}) => {
  const router = useRouter()

  return (
    <Link href={href}>
      <a
        className={cx(
          'py-1 px-4 focus:outline-none bg-gray-200 hover:bg-gray-300 active:bg-gray-400',
          {
            'bg-blue-500 hover:bg-blue-500 active:bg-blue-500 text-white':
              router.pathname === href,
          },
          className
        )}
      >
        {children}
      </a>
    </Link>
  )
}

export default ({
  left = (
    <Menu>
      <MenuButton className={className({ variant: 'primary' })}>
        Menu
      </MenuButton>
      <MenuList>
        {[...topLinks, ...moreLinks].map(([text, href]) => (
          <MenuLink key={href} as={NavLink} href={href}>
            {text}
          </MenuLink>
        ))}
      </MenuList>
    </Menu>
  ),
  title,
  right,
}: Props) => {
  const navSideClassNames = 'flex items-center w-full'

  const router = useRouter()

  return (
    <>
      <header
        className={cx(
          styles.navbar,
          'flex sm:hidden items-center flex-shrink-0 px-2 top-0 sticky z-10 bg-white border-b border-black border-opacity-25'
        )}
      >
        <div className={cx(navSideClassNames, 'justify-start')}>{left}</div>
        <div className="flex items-center flex-shrink-0 h-inherit">
          {title ?? 'HyperFokus'}
        </div>
        <div className={cx(navSideClassNames, 'justify-end')}>{right}</div>
      </header>
      <header
        className={cx(
          styles.navbar,
          'hidden sm:flex items-center flex-shrink-0 px-2 top-0 sticky z-10 bg-white'
        )}
      >
        <div className={cx(navSideClassNames, 'justify-start')}>HyperFokus</div>
        <div className="flex items-center flex-shrink-0 h-inherit">
          <nav className="gap-px grid grid-flow-col text-xs">
            {topLinks.map(([text, href], key) => (
              <TopLink
                className={cx({ 'rounded-l-lg': key === 0 })}
                key={href}
                href={href}
              >
                {text}
              </TopLink>
            ))}
            <TopLink className="rounded-r-lg" href="/more">
              More
            </TopLink>
          </nav>
        </div>
        <div className={cx(navSideClassNames, 'justify-end')}>{right}</div>
      </header>
    </>
  )
}
