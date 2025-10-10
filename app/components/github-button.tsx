"use client";

import React from "react";

interface GitHubButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function GitHubButton({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
}: GitHubButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-sf-pro";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary: {
      base: "bg-[#238636] border-[#238636] text-white hover:bg-[#2ea043] hover:border-[#2ea043] focus:ring-[#238636]",
      disabled: "bg-[#238636] border-[#238636] text-white",
    },
    secondary: {
      base: "bg-[#21262d] border-[#30363d] text-[#f0f6fc] hover:bg-[#30363d] hover:border-[#484f58] focus:ring-[#30363d]",
      disabled: "bg-[#21262d] border-[#30363d] text-[#f0f6fc]",
    },
    danger: {
      base: "bg-[#da3633] border-[#da3633] text-white hover:bg-[#f85149] hover:border-[#f85149] focus:ring-[#da3633]",
      disabled: "bg-[#da3633] border-[#da3633] text-white",
    },
    ghost: {
      base: "bg-transparent border-transparent text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc] focus:ring-[#30363d]",
      disabled: "bg-transparent border-transparent text-[#8b949e]",
    },
  };

  const currentVariant = variantClasses[variant];
  const buttonClasses = disabled
    ? currentVariant.disabled
    : currentVariant.base;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${buttonClasses} ${className}`}
    >
      {children}
    </button>
  );
}
