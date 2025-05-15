
import { useToast as useToastRadix } from "@/components/ui/toast"
import { toast as sonnerToast } from "sonner"

// Export both implementations - the original Radix implementation for backwards compatibility
export const useToast = useToastRadix
export const toast = sonnerToast
