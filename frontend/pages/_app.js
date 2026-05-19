import "../styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          ⚡ SyncUp
        </Link>
        <ul className="navbar-links">
          <li>
            <Link
              href="/"
              className={router.pathname === "/" ? "active" : ""}
            >
              Feed
            </Link>
          </li>
          <li>
            <Link
              href="/admin"
              className={router.pathname === "/admin" ? "active" : ""}
            >
              Admin
            </Link>
          </li>
        </ul>
      </nav>
      <Component {...pageProps} />
    </>
  );
}
