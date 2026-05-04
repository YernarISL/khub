import type { ButtonHTMLAttributes, ReactNode } from "react";

export type HomeButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "softBlue"
  | "success"
  | "ai";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: HomeButtonVariant;
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "home-ui-btn",
    `home-ui-btn--${variant}`,
    size === "sm" ? "home-ui-btn--sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
