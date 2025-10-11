// src/components/Sidebar.tsx
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useEffect, useState } from "react"; // Importar useEffect e useState

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

  // 1. Inicialize currentPath com uma string vazia no servidor
  // 2. Atualize-o com window.location.pathname APENAS quando o componente montar no cliente
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Este código só será executado no navegador após a montagem
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []); // O array vazio garante que o efeito só rode uma vez, na montagem

  return (
    <aside className="w-64 bg-neutral-100 border-r border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {userType === "admin" ? "FYC Admin" : "Minha Conta"}
        </h1>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          // Use currentPath do estado, que será populado no cliente
          const isActive = currentPath === link.href;

          return (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-neutral-200 dark:border-neutral-700">
        {" "}
        {/* Linha divisória */}
        {userType === "admin" && (
          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </a>
        )}
        <div className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors dark:text-neutral-200 dark:hover:bg-neutral-700">
          <AnimatedThemeToggler />
          <span className="font-medium">Tema</span>
        </div>
      </div>
    </aside>
  );
}
