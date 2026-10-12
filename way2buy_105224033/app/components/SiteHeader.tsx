"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthModal } from "./AuthModal";

interface SiteHeaderProps {
  activePath: "/" | "/produk" | "/titip";
}

interface UserSession {
  name: string;
  email: string;
  role: string;
}

const navigation = [
  { href: "/", label: "Beranda", shortLabel: "Beranda" },
  { href: "/produk", label: "Jelajahi produk", shortLabel: "Produk" },
  { href: "/titip", label: "Cara titip", shortLabel: "Titip" },
] as const;

export function SiteHeader({ activePath }: SiteHeaderProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" href="/">
            <span aria-hidden="true" className="brand__mark">w.</span>
            <span className="brand__name">way2buy<span className="brand__dot">.</span></span>
          </Link>
          <nav aria-label="Navigasi utama" className="site-nav">
            {navigation.map((item) => (
              <Link
                aria-current={activePath === item.href ? "page" : undefined}
                className={`site-nav__link${activePath === item.href ? " site-nav__link--active" : ""}`}
                href={item.href}
                key={item.href}
              >
                <span className="site-nav__label--desktop">{item.label}</span>
                <span className="site-nav__label--mobile">{item.shortLabel}</span>
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {userSession ? (
              <div className="user-badge-group">
                <span className="user-badge" title={`${userSession.name} (${userSession.role})`}>
                  👤 {userSession.name}
                </span>
                <button
                  className="btn-logout"
                  onClick={() => setUserSession(null)}
                  type="button"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                className="button button--small button--outline btn-auth"
                id="btn-auth-trigger"
                onClick={() => setIsAuthOpen(true)}
                style={{
                  backgroundColor: "transparent",
                  color: "#285a49",
                  border: "1.5px solid #285a49",
                  borderRadius: "8px",
                  padding: "0 16px",
                  minHeight: "40px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#285a49";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#285a49";
                }}
                type="button"
              >
                Daftar / Masuk
              </button>
            )}
            <Link className="button button--small header-cta" href="/titip">
              Mulai titip <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setUserSession(user)}
      />
    </>
  );
}
