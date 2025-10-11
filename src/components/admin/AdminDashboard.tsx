// src/components/admin/AdminDashboard.tsx
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data para simular dados do dashboard
const dashboardData = {
  totalItensGarimpo: 120,
  itensConsignacaoAtivos: 85,
  vendasMesAtual: 35,
  faturamentoMesAtual: 4500.75,
  lucroMesAtual: 1800.5,
  novosFornecedoresMes: 3,
  novosClientesMes: 10,
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-neutral-900 mb-6">
        Dashboard Admin
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Garimpo</CardTitle>
            <Package className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalItensGarimpo}
            </div>
            <p className="text-xs text-neutral-500">Total em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consignação Ativa
            </CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.itensConsignacaoAtivos}
            </div>
            <p className="text-xs text-neutral-500">Itens aguardando venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas (Mês)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.vendasMesAtual}
            </div>
            <p className="text-xs text-neutral-500">Total de transações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {dashboardData.lucroMesAtual.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-500">
              Faturamento: R$ {dashboardData.faturamentoMesAtual.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seções adicionais podem ser adicionadas aqui, como gráficos, últimas vendas, etc. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Novos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Fornecedores novos este mês:{" "}
              <span className="font-bold">
                {dashboardData.novosFornecedoresMes}
              </span>
            </p>
            <p>
              Clientes novos este mês:{" "}
              <span className="font-bold">
                {dashboardData.novosClientesMes}
              </span>
            </p>
          </CardContent>
        </Card>
        {/* Adicione outros cards ou gráficos aqui */}
        <Card>
          <CardHeader>
            <CardTitle>Atalhos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a href="/garimpo/novo">
              <Button variant="outline">Cadastrar Garimpo</Button>
            </a>
            <a href="/consignacao/novo">
              <Button variant="outline">Cadastrar Consignação</Button>
            </a>
            <a href="/vendas/novo">
              <Button variant="outline">Registrar Venda</Button>
            </a>
            <a href="/fornecedores/novo">
              <Button variant="outline">Novo Fornecedor</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
