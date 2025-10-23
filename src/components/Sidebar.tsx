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
    <aside className="w-64 bg-neutral-100 border-r border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 p-4 flex flex-col justify-between">
      {/* --- BLOCO DO TÍTULO ESTILIZADO (como na imagem) --- */}

      <div className="flex w-full items-center justify-between gap-2 mb-2">
        <a href="/" className="block w-full">
          <div className="flex items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none hover:cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors">
            <div className="size-16" aria-hidden="true">
              <img
                src="/logo-fyc-sem-fundo.png"
                alt="FYC Brechó Logo"
                className="bg-white size-full object-contain rounded-4xl"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-semibold">Find Your Clothes</span>{" "}
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                Brecho | Admin
              </span>
            </div>
          </div>
        </a>
        {/* <AnimatedThemeToggler /> */}
      </div>
      {/* --- FIM BLOCO DO TÍTULO --- */}

      <nav className="space-y-2 flex-1">
        {/* flex-1 para ocupar espaço restante */}
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath === link.href;

          return (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-neutral-300 text-neutral-800 dark:text-white dark:bg-neutral-700"
                  : "text-neutral-800 hover:bg-neutral-300 dark:text-neutral-200 dark:hover:bg-neutral-700"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-neutral-200 dark:border-neutral-700">
        {userType === "admin" && (
          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </a>
        )}
      </div>
    </aside>
  );
}
