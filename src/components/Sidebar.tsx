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
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {userType === "admin" ? "Brechó Admin" : "Minha Conta"}
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
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </a>
          );
        })}
      </nav>

      {userType === "admin" && (
        <div className="mt-auto pt-8">
          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </a>
        </div>
      )}
    </aside>
  );
}
