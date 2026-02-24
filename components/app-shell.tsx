"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/deadlines", label: "Deadlines" },
  { href: "/checklists", label: "Checklists" },
  { href: "/payments", label: "Payments" },
  { href: "/settings", label: "Settings" },
  { href: "/login", label: "Login" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Student Helper</p>
          <h1 className="brand">Visa & Finance Ops</h1>
        </div>
        <nav>
          <ul className="nav-list">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Link className={active ? "nav-link active" : "nav-link"} href={item.href as any}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
