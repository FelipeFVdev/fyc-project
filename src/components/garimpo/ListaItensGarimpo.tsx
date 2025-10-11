// src/components/garimpo/ListaItensGarimpo.tsx
import { useState } from "react";
import { ItemGarimpo } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data - substituir por dados reais
const mockItens: ItemGarimpo[] = [
  {
    id: "1",
    localCompra: "Bazar São Vicente",
    dataCompra: new Date("2025-10-01"),
    custoCompra: 15.0,
    custosAdicionais: 5.0,
    margemLucro: 50,
    precoVenda: 30.0,
    status: "disponivel",
    dataEntradaEstoque: new Date("2025-10-01"),
    marca: "Zara",
    tamanho: "M",
    categoria: "Vestido",
  },
];

export default function ListaItensGarimpo() {
  const [itens] = useState<ItemGarimpo[]>(mockItens);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "disponivel" | "vendido"
  >("todos");

  const itensFiltrados = itens.filter((item) => {
    const matchBusca =
      item.marca?.toLowerCase().includes(busca.toLowerCase()) ||
      item.categoria?.toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === "todos" || item.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por marca ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Status: {filtroStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFiltroStatus("todos")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus("disponivel")}>
              Disponível
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFiltroStatus("vendido")}>
              Vendido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Custo Total</TableHead>
              <TableHead>Preço Venda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Entrada</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensFiltrados.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">
                  {item.id.slice(0, 8)}
                </TableCell>
                <TableCell>{item.marca || "-"}</TableCell>
                <TableCell>{item.categoria || "-"}</TableCell>
                <TableCell>{item.tamanho || "-"}</TableCell>
                <TableCell>
                  R$ {(item.custoCompra + item.custosAdicionais).toFixed(2)}
                </TableCell>
                <TableCell className="font-semibold">
                  R$ {item.precoVenda.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "disponivel" ? "default" : "secondary"
                    }
                  >
                    {item.status === "disponivel" ? "Disponível" : "Vendido"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(item.dataEntradaEstoque, "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
