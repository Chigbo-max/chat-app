import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent ...",
  {
    variants: {
      variant: { default: "bg-primary text-white", outline: "border bg-white" },
      size: { default: "h-8 px-3", sm: "h-7 px-2", lg: "h-10 px-4" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>