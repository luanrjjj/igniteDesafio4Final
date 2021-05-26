import styles from './header.module.scss'
import Link from 'next/link';

export default function Header() {
  return (
    <div className = {styles.header}>
      <div   className= {styles.logoHeader}>
        <Link href="/">
        <a>
  <img  src ='/images/spacetraveling.png' alt ="logo"/>
  </a>
  </Link>
  </div>
  </div>
  )
}
