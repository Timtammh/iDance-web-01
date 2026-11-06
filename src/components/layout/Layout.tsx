import { lazy, Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, Menu, ArrowUpRight } from "lucide-react";
import { useContent } from "../../hooks/useContent";
const ParticleWaveBackground = lazy(() => import("../effects/ParticleWaveBackground").then(module => ({ default: module.ParticleWaveBackground })));
import { Modal } from "../ui/Modal";
import { savedConsent, setConsent } from "../../lib/analytics";
import topLogo from "../../pic/top.svg";
import bottomLogo from "../../pic/bottom.jpg";
import instagramIcon from "../../icon/instagram (1).png";
import facebookIcon from "../../icon/facebook.png";
import youtubeIcon from "../../icon/youtube.png";
const socialIcons = [
  { name: "Instagram", icon: instagramIcon, match: /instagram|^ig$/i },
  { name: "Facebook", icon: facebookIcon, match: /facebook|^fb$/i },
  { name: "YouTube", icon: youtubeIcon, match: /youtube|youtu\.be/i },
];
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
      <Suspense fallback={null}><ParticleWaveBackground /></Suspense>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header">
        <Link className="wordmark" to="/" aria-label="iDance home">
          <img src={topLogo} alt="iDance" width={47.3} height={57.2} />
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
              <img src={bottomLogo} alt="iDance" />
            </Link>
            <p className="footer-company-name">iDance International limited</p>
            <p>{data.settings.brandStatement}</p>
            <div className="footer-socials" aria-label="Social media">
              {socialIcons.map(({ name, icon, match }) => {
                const social = data.settings.socialLinks?.find(link => match.test(link.label) || match.test(link.url));
                const image = <img src={icon} alt={name} width={24} height={24} />;
                return social ? (
                  <a key={name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${name} (opens in new tab)`}>{image}</a>
                ) : <span key={name}>{image}</span>;
              })}
            </div>
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
