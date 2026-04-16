import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted text-muted-foreground",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 px-2",
        lg: "h-10 px-4",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>