"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useTheme } from "@/providers/ThemeProvider"
import { useState, useEffect } from "react"
import { Sun, Moon, X, ArrowRight } from "lucide-react"

import { animate, motion, AnimatePresence } from "framer-motion"

const menuVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsOpen(false);

    if (pathname !== "/") {
      router.push(`/#${id}`);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      animate(window.scrollY, offsetPosition, {
        type: "spring",
        stiffness: 100,
        damping: 20,
        restDelta: 0.001,
        onUpdate: (latest) => window.scrollTo(0, latest)
      });
    }
  };

  // Desktop-only scroll effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    handler()
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      <nav
        className={[
          "fixed left-0 right-0 z-50 transition-all duration-300 mx-auto rounded-2xl border",
          scrolled ? "top-4 mt-4 border-border bg-background/80 backdrop-blur-xl shadow-sm" : "top-0 mt-6 border-border/50 bg-background/60 backdrop-blur-md",
        ].join(" ")}
        style={{ width: 'calc(100% - 2rem)', maxWidth: '64rem' }}
      >
        <div className="px-4">
          <div className="flex items-center justify-between h-16 md:h-14">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-1 group">
                <img src="/logo.png" alt="OrgFlow" className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                <span className="font-bold text-foreground text-xl hidden sm:inline tracking-tight -ml-2">rgFlow</span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center space-x-8">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={[
                        "text-sm font-medium transition-colors duration-200 cursor-pointer",
                        pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      ].join(" ")}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/roles"
                      className={[
                        "text-sm font-medium transition-colors duration-200 cursor-pointer",
                        pathname === "/dashboard/roles" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      ].join(" ")}
                    >
                      Roles
                    </Link>
                    <Link
                      href="/dashboard/applications"
                      className={[
                        "text-sm font-medium transition-colors duration-200 cursor-pointer",
                        pathname === "/dashboard/applications" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      ].join(" ")}
                    >
                      Applications
                    </Link>
                  </>
                ) : (

                  <>

                    <div className="relative group">
                      <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer flex items-center gap-1">
                        Solutions
                        <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="bg-background border border-border rounded-xl shadow-xl p-2 overflow-hidden">
                          <Link href="/hr-software" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                            Human Resources
                          </Link>
                          <Link href="/recruitment-software" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                            Recruitment
                          </Link>
                          <Link href="/applicant-tracking-system" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                            Applicant Tracking
                          </Link>
                          <Link href="/time-tracking" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                            Time Tracking
                          </Link>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/#features"
                      onClick={(e) => scrollToSection(e, "features")}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                    >
                      Features
                    </Link>
                    <Link
                      href="/#pricing"
                      onClick={(e) => scrollToSection(e, "pricing")}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                    >
                      Pricing
                    </Link>

                    <Link
                      href="/#contact"
                      onClick={(e) => scrollToSection(e, "contact")}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                    >
                      Contact
                    </Link>
                    <Link
                      href="/roles"
                      className={[
                        "text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap",
                        pathname === "/roles" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      ].join(" ")}
                    >
                      Roles
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-all duration-300 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-foreground" />
                )}
              </button>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                {!user ? (
                  <>
                    <Link href="/login">
                      <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer">
                        Log In
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm flex items-center gap-2 cursor-pointer">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium text-sm cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                type="button"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition"
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="relative block h-4 w-5">
                  <span
                    className={[
                      "absolute inset-x-0 top-0 h-0.5 rounded-full transition-all duration-300",
                      "bg-foreground",
                      isOpen ? "translate-y-2 rotate-45" : "translate-y-0 rotate-0",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full transition-all duration-300",
                      "bg-foreground",
                      isOpen ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-all duration-300",
                      "bg-foreground",
                      isOpen ? "-translate-y-2 -rotate-45" : "translate-y-0 rotate-0",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>
          </div >
        </div >
      </nav >

      {/* Full-Screen Mobile Menu Overlay */}
      {/* Full-Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden fixed inset-0 z-[100] bg-background"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <Link href="/" className="flex items-center gap-1" onClick={() => setIsOpen(false)}>
                  <img src="/logo.png" alt="OrgFlow" className="h-11 w-auto object-contain" />
                  <span className="font-bold text-foreground text-2xl tracking-tight -ml-2">rgFlow</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-all duration-300"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-foreground" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
                <div className="space-y-14">
                  {user ? (
                    <>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-6 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">01</span>
                          <span className="text-5xl font-semibold text-foreground group-hover:text-primary transition-colors">Dashboard</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/dashboard/roles"
                          className="flex items-center gap-6 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">02</span>
                          <span className="text-5xl font-semibold text-foreground group-hover:text-primary transition-colors">Roles</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/dashboard/applications"
                          className="flex items-center gap-6 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">03</span>
                          <span className="text-5xl font-semibold text-foreground group-hover:text-primary transition-colors">Talent</span>
                        </Link>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/#features"
                          className="flex items-center gap-6 group cursor-pointer"
                          onClick={(e) => scrollToSection(e, "features")}
                        >
                          <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">01</span>
                          <span className="text-5xl font-semibold text-foreground group-hover:text-primary transition-colors">Features</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/#pricing"
                          className="flex items-center gap-6 group cursor-pointer"
                          onClick={(e) => scrollToSection(e, "pricing")}
                        >
                          <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">02</span>
                          <span className="text-5xl font-semibold text-foreground group-hover:text-primary transition-colors">Pricing</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/#reviews"
                          className="flex items-center gap-6 group cursor-pointer"
                          onClick={(e) => scrollToSection(e, "reviews")}
                        >
                          <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">03</span>
                          <span className="text-5xl font-semibold text-foreground group-hover:text-primary transition-colors">Reviews</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/#contact"
                          className="flex items-center gap-6 group cursor-pointer"
                          onClick={(e) => scrollToSection(e, "contact")}
                        >
                          <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">04</span>
                          <span className="text-5xl font-semibold text-foreground group-hover:text-primary transition-colors">Contact</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/roles"
                          className="flex items-center gap-6 group cursor-pointer"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-2xl font-medium text-foreground group-hover:text-primary transition-colors">05</span>
                          <span className="text-5xl font-semibold text-foreground group-hover:text-primary transition-colors">Roles</span>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Actions at Bottom */}
                <div className="mt-auto pt-8 flex flex-col gap-8">
                  {!user ? (
                    <>
                      <motion.div variants={itemVariants}>
                        <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full">
                          <button className="w-full py-4 text-lg font-bold text-foreground hover:bg-muted transition-all duration-200 rounded-lg border-2 border-primary cursor-pointer">
                            Log In
                          </button>
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link href="/register" onClick={() => setIsOpen(false)} className="block w-full">
                          <button className="w-full bg-primary text-primary-foreground py-4 text-lg font-bold hover:opacity-90 transition-all duration-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer">
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        </Link>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div variants={itemVariants}>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="w-full bg-red-700 text-white py-4 text-lg font-bold hover:bg-red-800 transition-colors duration-200 rounded-lg cursor-pointer"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  © {new Date().getFullYear()} OrgFlow. All rights reserved.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence >
    </>
  )
}