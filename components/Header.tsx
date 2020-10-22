import cx from 'classnames'
import MoreIcon from 'components/icons/more'
import SchedulesIcon from 'components/icons/schedules'
import TodosIcon from 'components/icons/todos'
import Logo from 'components/Logo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, Fragment, useEffect, useRef, useState } from 'react'
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
  ['More', '/more'],
]
export const moreLinks = [
  ['Completed Todos', '/done'],
  ['Settings', '/settings'],
  ['Help', '/help'],
]

const TopLink: React.FC<{
  className?: string
  href: string
  active: boolean
  tabIndex?: number
}> = ({ active, href, children, className, tabIndex }) => {
  return (
    <Link href={href}>
      <a
        tabIndex={tabIndex}
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

const iconsMap = new Map([
  ['/', TodosIcon],
  ['/schedules', SchedulesIcon],
  ['/more', MoreIcon],
])
const TabLink: React.FC<{
  href: string
  active: boolean
}> = ({ active, href, children }) => {
  const Icon = iconsMap.has(href) ? iconsMap.get(href) : Fragment
  return (
    <Link href={href}>
      <a
        className={cx(
          styles.tablink,
          'hover:bg-gray-100 focus:outline-none focus:text-blue-500',
          {
            'text-blue-500': active,
            'text-gray-500': !active,
          }
        )}
      >
        <Icon />
        <span className="text-xs pt-1 pb-1">{children}</span>
      </a>
    </Link>
  )
}

const CreateLink = ({
  label,
  tabIndex,
}: {
  label: string
  tabIndex?: number
}) => (
  <Link href="?create=true" shallow>
    <a
      tabIndex={tabIndex}
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

const isActive = ({ href, pathname }: { href: string; pathname: string }) => {
  switch (href) {
    case '/more':
      return (
        moreLinks.some(([, href]) => pathname === href) || pathname === '/more'
      )
    default:
      return pathname === href
  }
}

const Header = ({ createLink, title }: Props) => {
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
        <Fragment key="small">
          <header
            ref={domRef}
            className={cx(styles.navbar, 'flex px-inset', {
              'sm:hidden': larger === null,
            })}
          >
            <div className={cx(navSideClassNames, 'justify-start')}>
              <Logo />
            </div>

            <div className={cx(navSideClassNames, 'justify-end')}>
              {createLink && <CreateLink label={createLink} />}
            </div>
          </header>
          <nav
            className={cx(styles.tabbar, {
              'sm:hidden': larger === null,
            })}
          >
            {topLinks.map(([text, href]) => (
              <TabLink
                active={isActive({ href, pathname: router.pathname })}
                key={href}
                href={href}
              >
                {text}
              </TabLink>
            ))}
          </nav>
        </Fragment>
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
            <nav className="col-gap-px grid grid-flow-col text-xs">
              {topLinks.map(([text, href], key) => (
                <TopLink
                  tabIndex={1}
                  active={isActive({ href, pathname: router.pathname })}
                  className={cx({
                    'rounded-l-lg': key === 0,
                    'rounded-r-lg': key === topLinks.length - 1,
                  })}
                  key={href}
                  href={href}
                >
                  {text}
                </TopLink>
              ))}
            </nav>
          </div>
          <div className={cx(navSideClassNames, 'justify-end')}>
            {createLink && <CreateLink tabIndex={1} label={createLink} />}
          </div>
        </header>
      )}
    </>
  )
}

export default Header
