import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import cx from 'classnames'
import Logo from 'components/Logo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, useEffect, useRef, useState } from 'react'
import styles from './Header.module.css'

type Props = {
  createLink?: string
  title?: React.ReactNode
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
  return (
    <Link href={href}>
      <a
        className={cx(
          'py-1 px-4 focus:outline-none focus:shadow-outline',
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

const CreateLink = ({ label }: { label: string }) => (
  <Link href="?create=true" shallow scroll={false}>
    <a
      className="py-2 px-3 focus:outline-none focus:shadow-outline bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-blue-900 rounded"
      aria-label={label}
    >
      <svg
        aria-hidden
        className="fill-current"
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
      >
        <path d="M24 8h-8v-8h-8v8h-8v8h8v8h8v-8h8z" />
      </svg>
    </a>
  </Link>
)

export default ({ createLink, title }: Props) => {
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
          className={cx(styles.navbar, 'flex px-inset', {
            'sm:hidden': larger === null,
          })}
        >
          <div className={cx(navSideClassNames, 'justify-start')}>
            <Menu>
              <MenuButton className="py-1 px-4 focus:outline-none focus:shadow-outline bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-blue-900 rounded text-xs">
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
          </div>
          <div className="flex items-center flex-shrink-0 h-inherit px-1">
            <Logo />
          </div>
          <div className={cx(navSideClassNames, 'justify-end')}>
            {createLink && <CreateLink label={createLink} />}
          </div>
        </header>
      )}
      {(larger === true || larger === null) && (
        <header
          key="larger"
          ref={domRef}
          className={cx(styles.navbar, 'px-inset', {
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
          <div className={cx(navSideClassNames, 'justify-end')}>
            {createLink && <CreateLink label={createLink} />}
          </div>
        </header>
      )}
    </>
  )
}
