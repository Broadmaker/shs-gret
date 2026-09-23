import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base = "btn";
  const variants: Record<Variant, string> = {
    primary: "btn-primary",
    secondary: "btn-outline",
    ghost: "btn-ghost",
    outline: "btn-outline",
  };
  const sizes: Record<Size, string> = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}
