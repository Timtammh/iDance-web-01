import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, Menu, ArrowUpRight, AudioLines } from "lucide-react";
import { useContent } from "../../hooks/useContent";
import { Modal } from "../ui/Modal";
import { savedConsent, setConsent } from "../../lib/analytics";
export function Layout() {
  const data = useContent();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState(""),
    [cookies, setCookies] = useState(savedConsent() === null);
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const c = savedConsent();
    if (c) setConsent(c);
  }, []);
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    } else window.scrollTo(0, 0);
  }, [pathname, hash]);
  const nav = data.settings.navigation?.length
    ? data.settings.navigation
    : [
        { label: "Products", path: "/products" },
        { label: "Find Your Sound", path: "/#find-your-sound" },
        { label: "About", path: "/about" },
        { label: "TV", path: "/tv" },
        { label: "Contact", path: "/contact" },
      ];
  const close = () => {
    setMenu(false);
    setSearch(false);
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header">
        <Link className="wordmark" to="/" aria-label="iDance home">
          {data.settings.logo ? (
            <img src={data.settings.logo.url} alt="iDance" />
          ) : (
            <>
              iDance<span>®</span>
            </>
          )}
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {nav.map((n) => (
            <NavLink key={n.path} to={n.path}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Search products"
            onClick={(e) => { e.currentTarget.focus(); setSearch(true); }}
          >
            <Search size={20} />
          </button>
          <Link className="header-explore" to="/products">
            Explore sound <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label="Open navigation"
            aria-expanded={menu}
            onClick={(e) => { e.currentTarget.focus(); setMenu(true); }}
          >
            <Menu />
          </button>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-top">
          <div>
            <Link className="wordmark" to="/">
              iDance<span>®</span>
            </Link>
            <p>{data.settings.brandStatement}</p>
            <AudioLines size={30} strokeWidth={1} />
          </div>
          <div>
            <h3>Discover</h3>
            <Link to="/products">All products</Link>
            {data.categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </div>
          <div>
            <h3>iDance</h3>
            <Link to="/about">Our story</Link>
            <Link to="/tv">iDance TV</Link>
            <Link to="/news">News & stories</Link>
            <Link to="/contact">Contact us</Link>
          </div>
          <div>
            <h3>Stay connected</h3>
            {data.settings.socialLinks?.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
            <Link to="/contact">
              Product enquiries <ArrowUpRight size={14} />
            </Link>
            <p className="footer-note">
              Sound for the moments
              <br />
              that matter.
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} iDance.{" "}
            {data.demo ? "Demo website." : "All rights reserved."}
          </span>
          <div>
            <Link to="/privacy">Privacy · pending</Link>
            <button onClick={() => setCookies(true)}>Cookie settings</button>
          </div>
        </div>
      </footer>
      {menu && (
        <Modal title="Explore iDance" onClose={close}>
          <nav className="mobile-nav">
            {nav.map((n) => (
              <Link onClick={close} key={n.path} to={n.path}>
                {n.label}
                <ArrowUpRight />
              </Link>
            ))}
          </nav>
        </Modal>
      )}
      {search && (
        <Modal title="Find your sound" onClose={close}>
          <label className="field">
            Search products
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try karaoke or a product name"
              type="search"
            />
          </label>
          <div className="search-results" aria-live="polite">
            {data.products
              .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
              .map((p) => (
                <Link onClick={close} key={p.id} to={`/products/${p.slug}`}>
                  {p.name}
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            {!data.products.some((p) =>
              p.name.toLowerCase().includes(query.toLowerCase()),
            ) && <p>No products found. Try another name.</p>}
          </div>
        </Modal>
      )}
      {cookies && (
        <aside className="consent" aria-label="Analytics preferences">
          <div>
            <strong>A little choice. Your privacy.</strong>
            <p>
              Allow optional analytics to help us understand how this site is
              used? No analytics loads before you accept.
            </p>
          </div>
          <div className="consent-actions">
            <button
              onClick={() => {
                setConsent("rejected");
                setCookies(false);
              }}
            >
              Reject analytics
            </button>
            <button
              onClick={() => {
                setConsent("accepted");
                setCookies(false);
              }}
            >
              Accept analytics
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
