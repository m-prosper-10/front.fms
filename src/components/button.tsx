import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 px-4 py-2 text-white hover:bg-slate-800",
        ghost: "bg-transparent px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        outline: "border border-slate-200 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50"
      },
      size: {
        default: "",
        sm: "h-9 px-3",
        lg: "h-11 px-5"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
