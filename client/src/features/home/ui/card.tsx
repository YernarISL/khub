import type { HTMLAttributes, ReactNode } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...rest }: DivProps) {
  return (
    <div className={["home-card", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

type CardContentProps = DivProps & { children?: ReactNode };

export function CardContent({ className = "", children, ...rest }: CardContentProps) {
  return (
    <div
      className={["home-card-content", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
