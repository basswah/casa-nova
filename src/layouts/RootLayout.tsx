import logo from "./ChatGPT Image 4 يونيو 2026، 07_53_42 م.png";
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/admin/hooks/useUsers";
import { LanguageSwitcher } from "@/features/shared/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/features/shared/components/ThemeSwitcher";
import { ToastContainer } from "@/features/shared/components/Toast";
import { ShortcutsHelp } from "@/features/shared/components/ShortcutsHelp";
import { SkeletonCard } from "@/features/shared/components/Skeleton";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ease-out-expo ${
    isActive
      ? "bg-brand-gold text-brand-black"
      : "text-brand-muted hover:text-brand-light hover:bg-white/5"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
    isActive
      ? "bg-brand-gold/10 text-brand-gold"
      : "text-brand-muted hover:text-brand-light hover:bg-white/5"
  }`;

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path
      fillRule="evenodd"
      d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"
      clipRule="evenodd"
    />
  </svg>
);

export const RootLayout = () => {
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
        <SkeletonCard />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = (profile?.display_name || user.email || "?")
    .charAt(0)
    .toUpperCase();

  const navLinks = (
    <>
      <NavLink to="/" className={linkClass} end>
        {t("nav.home")}
      </NavLink>
      <NavLink to="/inventory" className={linkClass}>
        {t("nav.inventory")}
      </NavLink>
      <NavLink to="/pos" className={linkClass}>
        {t("nav.pos")}
      </NavLink>
      <NavLink to="/purchases" className={linkClass}>
        {t("nav.purchases")}
      </NavLink>
      <NavLink to="/purchases/suppliers" className={linkClass}>
        {t("nav.suppliers")}
      </NavLink>
      <NavLink to="/reports" className={linkClass}>
        {t("nav.reports")}
      </NavLink>
      <NavLink to="/sales" className={linkClass}>
        {t("nav.sales")}
      </NavLink>
      <NavLink to="/returns" className={linkClass}>
        {t("nav.returns")}
      </NavLink>
      {profile?.role === "admin" && (
        <NavLink to="/admin/users" className={linkClass}>
          {t("nav.users")}
        </NavLink>
      )}
      <NavLink to="/settings" className={linkClass}>
        {t("nav.settings")}
      </NavLink>
    </>
  );

  const mobileLinks = (
    <>
      <NavLink to="/" className={mobileLinkClass} end>
        {t("nav.home")}
      </NavLink>
      <NavLink to="/inventory" className={mobileLinkClass}>
        {t("nav.inventory")}
      </NavLink>
      <NavLink to="/pos" className={mobileLinkClass}>
        {t("nav.pos")}
      </NavLink>
      <NavLink to="/purchases" className={mobileLinkClass}>
        {t("nav.purchases")}
      </NavLink>
      <NavLink to="/purchases/suppliers" className={mobileLinkClass}>
        {t("nav.suppliers")}
      </NavLink>
      <NavLink to="/reports" className={mobileLinkClass}>
        {t("nav.reports")}
      </NavLink>
      <NavLink to="/sales" className={mobileLinkClass}>
        {t("nav.sales")}
      </NavLink>
      <NavLink to="/returns" className={mobileLinkClass}>
        {t("nav.returns")}
      </NavLink>
      {profile?.role === "admin" && (
        <NavLink to="/admin/users" className={mobileLinkClass}>
          {t("nav.users")}
        </NavLink>
      )}
      <NavLink to="/settings" className={mobileLinkClass}>
        {t("nav.settings")}
      </NavLink>
    </>
  );

  return (
    <div
      className="min-h-screen bg-brand-black text-brand-light flex flex-col"
      dir="auto"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-gold focus:text-brand-black focus:rounded-lg focus:shadow-[var(--shadow-floating)]"
      >
        {t("common.skipToContent") || "Skip to content"}
      </a>
      <ToastContainer />

      {/* Desktop navbar */}
      <nav className="bg-brand-dark border-b border-brand-border hidden lg:block">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
<NavLink
               to="/"
               className="flex items-center shrink-0 mr-10 hover:opacity-80 transition-opacity"
             >
               <img src={logo} alt="Logo" className="h-15 md:h-18 w-auto object-contain" />
             </NavLink>

            <div className="flex items-center gap-0.5 flex-1">{navLinks}</div>

            <div className="flex items-center gap-3 shrink-0 ml-6 pl-6 border-l border-brand-border">
              <NavLink
                to="/profile"
                className="w-8 h-8 rounded-full bg-brand-surface-hover flex items-center justify-center text-xs font-medium text-brand-muted hover:bg-brand-gold hover:text-brand-black transition-all duration-300 ease-out-expo shrink-0"
                aria-label={t("profile.profile")}
                title={t("profile.profile")}
              >
                {initials}
              </NavLink>
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile navbar */}
      <nav className="bg-brand-dark border-b border-brand-border lg:hidden">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
<NavLink
               to="/"
               className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
             >
               <img src={logo} alt="Logo" className="h-15 md:h-18 w-auto object-contain" />
             </NavLink>

            <div className="flex items-center gap-1">
              <ThemeSwitcher />
              <LanguageSwitcher />
              <button
                onClick={() => setMobileOpen(true)}
                className="w-9 h-9 flex flex-col items-center justify-center gap-[3px] rounded-lg hover:bg-white/5 transition-colors duration-200 ml-1"
                aria-label="Open navigation menu"
              >
                <span className="block w-[18px] h-[2px] bg-brand-muted rounded-full transition-all duration-300" />
                <span className="block w-[18px] h-[2px] bg-brand-muted rounded-full transition-all duration-300" />
                <span className="block w-[18px] h-[2px] bg-brand-muted rounded-full transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out-expo lg:hidden ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out-expo ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[280px] max-w-[85vw] bg-brand-dark border-l border-brand-border shadow-[var(--shadow-floating)] transition-transform duration-300 ease-out-expo ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-5">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-widest">
                {t("nav.title")}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors duration-200 text-brand-muted"
                aria-label="Close navigation menu"
              >
                <CloseIcon />
              </button>
            </div>

            <NavLink
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg bg-brand-surface-hover/50 hover:bg-brand-surface-hover transition-colors duration-200 mb-6"
            >
              <div className="w-10 h-10 rounded-full bg-brand-surface-hover flex items-center justify-center text-sm font-medium text-brand-muted">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-brand-light truncate">
                  {profile?.display_name || user.email}
                </span>
                <span className="text-xs text-brand-muted truncate">
                  {user.email}
                </span>
              </div>
            </NavLink>

            <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
              {mobileLinks}
            </div>

            <div className="pt-4 mt-4 border-t border-brand-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-brand-muted hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all duration-200"
              >
                <LogoutIcon />
                {t("auth.logout")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main id="main-content" className="flex-1 p-6">
        <Outlet />
      </main>
      <ShortcutsHelp />
    </div>
  );
};
