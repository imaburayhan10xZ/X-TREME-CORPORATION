import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(currencyCode: string = "USD") {
  const map: Record<string, string> = {
    USD: "$",
    BDT: "৳",
    EUR: "€",
    GBP: "£",
  };
  
  if (currencyCode.includes('(')) {
    return currencyCode.match(/\((.*?)\)/)?.[1] || '$';
  }
  
  return map[currencyCode] || "$";
}
