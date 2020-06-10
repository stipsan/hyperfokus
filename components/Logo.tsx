import Link from 'next/link'
import styles from './Logo.module.css'

export default () => (
  <Link href="/">
    <a className={styles.logo} role="img" aria-label="HyperFokus logo">
      <span className="font-extrabold text-blue-800">Hyper</span>
      <span className="rounded inline-block bg-blue-700 text-white ml-1 px-1 font-bold">
        Fokus
      </span>
    </a>
  </Link>
)
