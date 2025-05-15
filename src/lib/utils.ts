
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Ghana cedis currency
 */
export function formatCedi(amount: number): string {
  return `₵${amount.toFixed(2)}`;
}

/**
 * Format a number as Ghana cedis currency with the currency code
 */
export function formatCediFull(amount: number): string {
  return `GHS ${amount.toFixed(2)}`;
}
