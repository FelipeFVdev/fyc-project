"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes"; // Renomeado para evitar conflito

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // Onde o tema será aplicado (body, html, etc.)
      defaultTheme="system" // Tema padrão
      enableSystem // Permite ao usuário alternar entre o tema do sistema
      disableTransitionOnChange // Desabilita transições ao mudar o tema
    >
      {children}
    </NextThemesProvider>
  );
}
