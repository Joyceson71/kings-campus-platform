import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "pink" | "yellow";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "btn-chaos",
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "ghost" && "btn-secondary",
        variant === "danger" && "btn-chaos",
        variant === "pink" && "btn-pink",
        variant === "yellow" && "btn-chaos",
        className
      )}
      style={
        variant === "danger"
          ? {
              background: "rgba(255,68,58,0.12)",
              borderColor: "rgba(255,68,58,0.3)",
              color: "#ff453a"
            }
          : variant === "yellow"
          ? {
              background: "rgba(255,236,0,0.1)",
              borderColor: "rgba(255,236,0,0.3)",
              color: "#ffec00"
            }
          : undefined
      }
      {...props}
    />
  );
}
