"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "ABOUT" },
  { href: "/works", label: "WORKS" },
  { href: "/researches", label: "RESEARCHES" },
  { href: "/news", label: "NEWS" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 hover:text-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="pt-20 sm:pt-20 px-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 py-3 px-4 rounded-lg transition-colors text-base sm:text-sm font-medium tracking-wide",
                      isActive
                        ? "bg-amber-50 text-amber-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full bg-gray-300 shrink-0",
                        isActive && "bg-amber-500"
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
