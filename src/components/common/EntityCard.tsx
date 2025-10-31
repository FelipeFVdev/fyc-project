// src/components/common/EntityCard.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface EntityMetaItem {
  label: string;
  value: React.ReactNode;
}

interface EntityInfoRow {
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface EntityCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  meta?: EntityMetaItem[];
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  trailing?: React.ReactNode; // custom trailing content (e.g., badges)
  avatarText?: string; // e.g., first letter
  infoRows?: EntityInfoRow[]; // rows with icons like phone, location, etc
  footerLeft?: React.ReactNode; // e.g., Registered date
  footerRight?: React.ReactNode; // e.g., View History action
}

export default function EntityCard({
  title,
  subtitle,
  description,
  meta = [],
  onView,
  onEdit,
  onDelete,
  disabled,
  trailing,
  avatarText,
  infoRows,
  footerLeft,
  footerRight,
}: EntityCardProps) {
  return (
    <Card className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {avatarText && (
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full text-sm font-bold">
              {avatarText}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{title}</div>
            {subtitle && (
              <div className="text-muted-foreground truncate text-sm">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={disabled}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={onView}>Ver perfil</DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {description && (
        <div className="text-muted-foreground text-sm">{description}</div>
      )}

      {Array.isArray(infoRows) && infoRows.length > 0 && (
        <div className="flex flex-col gap-2">
          {infoRows.map((row, idx) => (
            <div
              key={idx}
              className="text-muted-foreground flex items-center gap-2 text-sm"
            >
              {row.icon && (
                <span className="text-muted-foreground">{row.icon}</span>
              )}
              <span className="text-foreground truncate">{row.content}</span>
            </div>
          ))}
        </div>
      )}

      {meta.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {meta.map((m, idx) => (
            <div key={idx} className="min-w-0">
              <div className="text-muted-foreground truncate">{m.label}</div>
              <div className="truncate font-medium">{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {(footerLeft || footerRight) && (
        <div className="border-t pt-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground">{footerLeft}</div>
            {footerRight}
          </div>
        </div>
      )}

      {trailing && <div className="pt-1">{trailing}teste</div>}
    </Card>
  );
}
