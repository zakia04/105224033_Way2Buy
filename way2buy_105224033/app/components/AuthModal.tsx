"use client";

import { useState, useEffect, FormEvent } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
  initialMode?: "daftar" | "masuk";
}

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "daftar",
}: AuthModalProps) {
  const [mode, setMode] = useState<"daftar" | "masuk">(initialMode);

  // Form Daftar
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Form Masuk
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Keyboard Escape listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegErrors({});
      setLoginError(null);
      setSuccessMessage(null);
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (regName.trim().length < 2) {
      errors.name = "Nama lengkap minimal 2 karakter.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      errors.email = "Format email tidak valid.";
    }
    if (regPassword.length < 8) {
      errors.password = "Password minimal 8 karakter.";
    }
    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = "Konfirmasi password tidak cocok.";
    }

    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(`Akun berhasil dibuat! Selamat datang di Way2Buy, ${regName}.`);
      setTimeout(() => {
        onLoginSuccess({
          name: regName,
          email: regEmail,
          role: "Konsumen",
        });
        onClose();
      }, 900);
    }, 500);
  }

  function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      setLoginError("Masukkan alamat email yang valid.");
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const displayName = loginEmail.split("@")[0];
      setSuccessMessage(`Berhasil masuk! Selamat datang kembali, ${displayName}.`);
      setTimeout(() => {
        onLoginSuccess({
          name: displayName,
          email: loginEmail,
          role: "Konsumen",
        });
        onClose();
      }, 900);
    }, 500);
  }

  // Palet Warna Brand Way2Buy
  const THEME = {
    green: "#285a49",       // Primary Brand Green
    greenDark: "#1d4538",   // Darker Green Hover
    ink: "#203a35",         // Dark Text
    inkSoft: "#536b64",     // Muted Text
    coral: "#e98467",       // Brand Coral Accent
    coralDark: "#d97155",   // Coral Hover
    line: "#e6e5da",        // Border Line
    paper: "#faf9f4",       // Warm Paper Background
  };

  return (
    <div
      aria-labelledby="auth-modal-title"
      aria-modal="true"
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(32, 58, 53, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "420px",
          padding: "36px 32px 32px",
          boxShadow: "0 20px 45px rgba(32, 58, 53, 0.25)",
          border: `1px solid ${THEME.line}`,
          position: "relative",
          color: THEME.ink,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      >
        {/* Tombol Close */}
        <button
          aria-label="Tutup jendela"
          onClick={onClose}
          type="button"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            color: THEME.inkSoft,
            cursor: "pointer",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            lineHeight: 1,
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = THEME.paper;
            e.currentTarget.style.color = THEME.ink;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = THEME.inkSoft;
          }}
        >
          ✕
        </button>

        {successMessage ? (
          <div
            role="status"
            style={{
              textAlign: "center",
              padding: "24px 8px",
              color: THEME.green,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: "2.5rem",
                display: "block",
                marginBottom: "12px",
                color: THEME.green,
              }}
            >
              ✓
            </span>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: THEME.ink }}>
              {successMessage}
            </p>
          </div>
        ) : mode === "daftar" ? (
          /* ──────────────────────────────────────────
             MODE 1: BUAT AKUN BARU
             ────────────────────────────────────────── */
          <div>
            <h1
              id="auth-modal-title"
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: THEME.ink,
                margin: "0 0 6px",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              Buat Akun Baru
            </h1>
            <p
              style={{
                fontSize: "14.5px",
                color: THEME.inkSoft,
                margin: "0 0 24px",
                lineHeight: 1.4,
              }}
            >
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("masuk");
                  setRegErrors({});
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: THEME.coral,
                  fontWeight: 700,
                  fontSize: "14.5px",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                  e.currentTarget.style.color = THEME.coralDark;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                  e.currentTarget.style.color = THEME.coral;
                }}
              >
                Masuk di sini
              </button>
            </p>

            <form noValidate onSubmit={handleRegisterSubmit}>
              {/* Field 1: Nama Lengkap */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="auth-nama-lengkap"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 650,
                    color: THEME.ink,
                    marginBottom: "6px",
                  }}
                >
                  Nama Lengkap
                </label>
                <input
                  autoComplete="name"
                  id="auth-nama-lengkap"
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nama kamu"
                  type="text"
                  value={regName}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: regErrors.name ? "1px solid #ef4444" : `1px solid ${THEME.line}`,
                    backgroundColor: "#ffffff",
                    color: THEME.ink,
                    fontSize: "14.5px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = THEME.green;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40, 90, 73, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = regErrors.name ? "#ef4444" : THEME.line;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {regErrors.name && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0", fontWeight: 500 }}>
                    {regErrors.name}
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="auth-email"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 650,
                    color: THEME.ink,
                    marginBottom: "6px",
                  }}
                >
                  Email
                </label>
                <input
                  autoComplete="email"
                  id="auth-email"
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  type="email"
                  value={regEmail}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: regErrors.email ? "1px solid #ef4444" : `1px solid ${THEME.line}`,
                    backgroundColor: "#ffffff",
                    color: THEME.ink,
                    fontSize: "14.5px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = THEME.green;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40, 90, 73, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = regErrors.email ? "#ef4444" : THEME.line;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {regErrors.email && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0", fontWeight: 500 }}>
                    {regErrors.email}
                  </p>
                )}
              </div>

              {/* Field 3: Password */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="auth-password"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 650,
                    color: THEME.ink,
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>
                <input
                  autoComplete="new-password"
                  id="auth-password"
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  type="password"
                  value={regPassword}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: regErrors.password ? "1px solid #ef4444" : `1px solid ${THEME.line}`,
                    backgroundColor: "#ffffff",
                    color: THEME.ink,
                    fontSize: "14.5px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = THEME.green;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40, 90, 73, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = regErrors.password ? "#ef4444" : THEME.line;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {regErrors.password && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0", fontWeight: 500 }}>
                    {regErrors.password}
                  </p>
                )}
              </div>

              {/* Field 4: Konfirmasi Password */}
              <div style={{ marginBottom: "22px" }}>
                <label
                  htmlFor="auth-konfirmasi-password"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 650,
                    color: THEME.ink,
                    marginBottom: "6px",
                  }}
                >
                  Konfirmasi Password
                </label>
                <input
                  autoComplete="new-password"
                  id="auth-konfirmasi-password"
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  type="password"
                  value={regConfirmPassword}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: regErrors.confirmPassword ? "1px solid #ef4444" : `1px solid ${THEME.line}`,
                    backgroundColor: "#ffffff",
                    color: THEME.ink,
                    fontSize: "14.5px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = THEME.green;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40, 90, 73, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = regErrors.confirmPassword ? "#ef4444" : THEME.line;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {regErrors.confirmPassword && (
                  <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0", fontWeight: 500 }}>
                    {regErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Tombol Daftar — Warna Khas Way2Buy (Forest Green) */}
              <button
                disabled={isLoading}
                type="submit"
                style={{
                  display: "block",
                  width: "100%",
                  backgroundColor: THEME.green,
                  color: "#ffffff",
                  border: `1px solid ${THEME.green}`,
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.75 : 1,
                  boxShadow: "0 2px 6px rgba(40, 90, 73, 0.25)",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = THEME.greenDark;
                    e.currentTarget.style.borderColor = THEME.greenDark;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = THEME.green;
                    e.currentTarget.style.borderColor = THEME.green;
                    e.currentTarget.style.transform = "none";
                  }
                }}
              >
                {isLoading ? "Mendaftarkan..." : "Daftar"}
              </button>
            </form>
          </div>
        ) : (
          /* ──────────────────────────────────────────
             MODE 2: MASUK (LOGIN)
             ────────────────────────────────────────── */
          <div>
            <h1
              id="auth-modal-title"
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: THEME.ink,
                margin: "0 0 6px",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              Masuk
            </h1>
            <p
              style={{
                fontSize: "14.5px",
                color: THEME.inkSoft,
                margin: "0 0 24px",
                lineHeight: 1.4,
              }}
            >
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("daftar");
                  setLoginError(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: THEME.coral,
                  fontWeight: 700,
                  fontSize: "14.5px",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                  e.currentTarget.style.color = THEME.coralDark;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                  e.currentTarget.style.color = THEME.coral;
                }}
              >
                Daftar di sini
              </button>
            </p>

            {loginError && (
              <div
                role="alert"
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: "13px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                ⚠ {loginError}
              </div>
            )}

            <form noValidate onSubmit={handleLoginSubmit}>
              {/* Field 1: Email */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="login-email"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 650,
                    color: THEME.ink,
                    marginBottom: "6px",
                  }}
                >
                  Email
                </label>
                <input
                  autoComplete="email"
                  id="login-email"
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  type="email"
                  value={loginEmail}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${THEME.line}`,
                    backgroundColor: "#ffffff",
                    color: THEME.ink,
                    fontSize: "14.5px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = THEME.green;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40, 90, 73, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = THEME.line;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Field 2: Password */}
              <div style={{ marginBottom: "22px" }}>
                <label
                  htmlFor="login-password"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 650,
                    color: THEME.ink,
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>
                <input
                  autoComplete="current-password"
                  id="login-password"
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password kamu"
                  type="password"
                  value={loginPassword}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${THEME.line}`,
                    backgroundColor: "#ffffff",
                    color: THEME.ink,
                    fontSize: "14.5px",
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 150ms ease, box-shadow 150ms ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = THEME.green;
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40, 90, 73, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = THEME.line;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Tombol Masuk — Warna Khas Way2Buy */}
              <button
                disabled={isLoading}
                type="submit"
                style={{
                  display: "block",
                  width: "100%",
                  backgroundColor: THEME.green,
                  color: "#ffffff",
                  border: `1px solid ${THEME.green}`,
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.75 : 1,
                  boxShadow: "0 2px 6px rgba(40, 90, 73, 0.25)",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = THEME.greenDark;
                    e.currentTarget.style.borderColor = THEME.greenDark;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = THEME.green;
                    e.currentTarget.style.borderColor = THEME.green;
                    e.currentTarget.style.transform = "none";
                  }
                }}
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
