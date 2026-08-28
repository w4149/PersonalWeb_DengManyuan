"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { anchor: "#home", legacyPath: "/", label: "HOME" },
  { anchor: "#about", legacyPath: "/about", label: "ABOUT" },
  { anchor: "#works", legacyPath: "/works", label: "WORKS" },
  { anchor: "#researches", legacyPath: "/researches", label: "RESEARCHES" },
  { anchor: "#news", legacyPath: "/news", label: "NEWS" },
];

function useHash() {
  // ⚠️ 关键 SSR 约束：首帧 useState 初始值必须在服务端 / 客户端首帧完全一致，
  // 否则 Next.js App Router + React 18 StrictMode 会抛 Hydration Mismatch → 移动端直接白屏崩溃。
  // 因此永远不要在 useState 初始化里读 window.location.hash；
  // 统一先给空字符串，再在客户端 useEffect 中同步真实 hash。
  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return hash;
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const hash = useHash();

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
              // isActive:
              // 1. 在首页（单页模式）下：根据 hash 判断（/#works → hash = #works）
              // 2. 在独立路由页面（如 /works/installations/2025）下：根据 pathname 前缀判断
              let isActive = false;
              if (pathname === "/") {
                const currentHash = hash || "#home";
                isActive = currentHash === item.anchor;
              } else if (item.legacyPath === "/") {
                // 非首页时 HOME 不高亮
                isActive = false;
              } else {
                isActive = pathname.startsWith(item.legacyPath);
              }

              return (
                <li key={item.anchor}>
                  <Link
                    href={`/${item.anchor}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block py-3 px-4 rounded-lg transition-colors text-base sm:text-sm font-medium tracking-wide",
                      isActive
                        ? "text-gray-900 bg-gray-200"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
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
