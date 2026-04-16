"use client";

import { useState, forwardRef, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className = "", ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={`${className} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-[#999] hover:text-[#1a1a1a] transition-colors"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    );
  }
);