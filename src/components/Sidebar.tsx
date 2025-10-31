// src/components/Sidebar.tsx
"use client";

import {
  Home,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  StoreIcon,
  // Não precisamos mais de Sun/Moon aqui, pois AnimatedThemeToggler os gerencia
} from "lucide-react";
import { cn } from "@/lib/utils";
// --- IMPORTAR AnimatedThemeToggler ---
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"; // Este arquivo permanece intocado
import { useEffect, useState } from "react";
// --- useTheme não é mais necessário aqui se o ícone do tema não muda no h1 ---
// import { useTheme } from "next-themes";

interface SidebarProps {
  userType: "admin" | "fornecedor";
}

const adminLinks = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/garimpo", icon: Package, label: "Garimpo" },
  { href: "/consignacao", icon: Users, label: "Consignação" },
  { href: "/vendas", icon: ShoppingCart, label: "Vendas" },
  { href: "/fornecedores", icon: Users, label: "Fornecedores" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/relatorios", icon: FileText, label: "Relatórios" },
];

const fornecedorLinks = [
  { href: "/dashboard-fornecedor", icon: Home, label: "Meu Dashboard" },
  { href: "/dashboard-fornecedor/itens", icon: Package, label: "Meus Itens" },
  { href: "/dashboard-fornecedor/extrato", icon: FileText, label: "Extrato" },
  {
    href: "/dashboard-fornecedor/saque",
    icon: ShoppingCart,
    label: "Solicitar Saque",
  },
];

export default function Sidebar({ userType }: SidebarProps) {
  const links = userType === "admin" ? adminLinks : fornecedorLinks;
  const [currentPath, setCurrentPath] = useState("");
  // const { theme, setTheme } = useTheme(); // Removido, a menos que haja outra necessidade

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  return (
    <aside className="flex w-64 flex-col justify-between bg-neutral-50 shadow-lg">
      {/* --- BLOCO DO TÍTULO ESTILIZADO (como na imagem) --- */}

      <div className="flex w-full items-center justify-between gap-2 p-4">
        <a href="/" className="block w-full">
          <div className="flex items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-colors outline-none hover:cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700">
            <div className="size-16" aria-hidden="true">
              <img
                src="/logo-fyc-sem-fundo.png"
                alt="FYC Brechó Logo"
                className="size-full rounded-4xl bg-white object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-semibold">Find Your Clothes</span>{" "}
              <span className="text-muted-foreground text-xs">
                Brecho | Admin
              </span>
            </div>
          </div>
        </a>
        {/* <AnimatedThemeToggler /> */}
      </div>

      <div className="mt-auto border-t border-neutral-200 pt-4 dark:border-neutral-700"></div>
      {/* --- FIM BLOCO DO TÍTULO --- */}

      <nav className="flex-1 space-y-2 p-4">
        {/* flex-1 para ocupar espaço restante */}
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath === link.href;

          return (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                isActive
                  ? "bg-neutral-300 text-neutral-800 shadow-lg dark:bg-neutral-700 dark:text-white"
                  : "text-neutral-800 hover:bg-neutral-300 dark:text-neutral-200 dark:hover:bg-neutral-700",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{link.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-neutral-200 p-4 pt-8 dark:border-neutral-700">
        {userType === "admin" && (
          <a
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Configurações</span>
          </a>
        )}
      </div>
    </aside>
  );
}
