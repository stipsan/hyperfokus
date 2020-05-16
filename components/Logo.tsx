import styles from './Logo.module.css'

export default () => (
  <span className={styles.logo} role="img" aria-label="HyperFokus logo">
    <span className="font-bold text-black">Hyper</span>
    <span className="rounded inline-block bg-black text-white ml-1 px-1 font-bold">
      Fokus
    </span>
  </span>
)
