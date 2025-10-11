// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- NOVAS FUNÇÕES DE FORMATAÇÃO ---

/**
 * Formata um CPF para o padrão "000.000.000-00".
 * @param value O CPF (apenas dígitos).
 * @returns O CPF formatado.
 */
export const formatCpf = (value: string): string => {
  if (!value) return "";
  value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
  return value
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca um ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca um ponto entre o sexto e o sétimo dígitos
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca um hífen entre o nono e o décimo dígitos
};

/**
 * Formata um telefone para os padrões "(00) 0000-0000" ou "(00) 00000-0000".
 * @param value O telefone (apenas dígitos).
 * @returns O telefone formatado.
 */
export const formatTelefone = (value: string): string => {
  if (!value) return "";
  value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
  if (value.length > 10) {
    // Celular com 9 dígitos: (XX) XXXXX-XXXX
    return value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (value.length > 5) {
    // Fixo ou celular antigo: (XX) XXXX-XXXX
    return value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 2) {
    // Apenas DDD: (XX) XXX
    return value.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
  } else {
    // Apenas dígitos iniciais
    return value.replace(/^(\d*)/, "($1");
  }
};

/**
 * Formata um CEP para o padrão "00000-000".
 * @param value O CEP (apenas dígitos).
 * @returns O CEP formatado.
 */
export const formatCep = (value: string): string => {
  if (!value) return "";
  value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
  return value.replace(/^(\d{5})(\d{3})$/, "$1-$2");
};

// --- FIM DAS NOVAS FUNÇÕES ---
