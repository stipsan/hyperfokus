import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import cx from 'classnames'
import { className } from 'components/Button'
import Logo from 'components/Logo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, useEffect, useRef, useState } from 'react'
import styles from './Header.module.css'

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
  ['Completed Todos', '/done'],
  ['Help', '/help'],
]

const TopLink: React.FC<{
  className?: string
  href: string
  active: boolean
}> = ({ active, href, children, className }) => {
  const router = useRouter()

  return (
    <Link href={href}>
      <a
        className={cx(
          'py-1 px-4 focus:outline-none ',
          {
            'bg-blue-500 hover:bg-blue-500 active:bg-blue-500 text-white': active,
            'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-blue-900': !active,
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

  const [larger, setLarger] = useState(null)
  const domRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const breakpoint = window
      .getComputedStyle(domRef.current)
      .getPropertyValue(`--header-breakpoint`)

    const mql = window.matchMedia(`(min-width: ${breakpoint})`)
    setLarger(mql.matches)

    const handler = (event) => {
      setLarger(event.matches)
    }
    mql.addListener(handler)

    return () => mql.removeListener(handler)
  }, [])

  return (
    <>
      {(larger === false || larger === null) && (
        <header
          key="small"
          ref={domRef}
          className={cx(styles.navbar, 'flex px-2', {
            'sm:hidden': larger === null,
          })}
        >
          <div className={cx(navSideClassNames, 'justify-start')}>{left}</div>
          <div className="flex items-center flex-shrink-0 h-inherit">
            <Logo />
          </div>
          <div className={cx(navSideClassNames, 'justify-end')}>{right}</div>
        </header>
      )}
      {(larger === true || larger === null) && (
        <header
          key="larger"
          ref={domRef}
          className={cx(styles.navbar, 'px-4', {
            'hidden sm:flex': larger === null,
            flex: larger !== null,
          })}
        >
          <div className={cx(navSideClassNames, 'justify-start')}>
            <Logo />
          </div>
          <div className="flex items-center flex-shrink-0 h-inherit">
            <nav className="gap-px grid grid-flow-col text-xs">
              {topLinks.map(([text, href], key) => (
                <TopLink
                  active={router.pathname === href}
                  className={cx({ 'rounded-l-lg': key === 0 })}
                  key={href}
                  href={href}
                >
                  {text}
                </TopLink>
              ))}
              <TopLink
                active={
                  moreLinks.some(([, href]) => router.pathname === href) ||
                  router.pathname === '/more'
                }
                className="rounded-r-lg"
                href="/more"
              >
                More
              </TopLink>
            </nav>
          </div>
          <div className={cx(navSideClassNames, 'justify-end')}>{right}</div>
        </header>
      )}
    </>
  )
}
