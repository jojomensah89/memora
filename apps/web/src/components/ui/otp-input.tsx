"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface OTPInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
}

export function OTPInput({
  length = 6,
  value = "",
  onChange,
  className,
  ...props
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, currentValue: string) => {
    const newOtp = value.split("");
    newOtp[index] = currentValue;
    const otpValue = newOtp.join("").slice(0, length);

    onChange?.(otpValue);

    // Auto-focus next input
    if (currentValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      onChange?.(pastedData.padEnd(length, ""));
      // Focus on the last filled input
      const lastFilledIndex = pastedData.length - 1;
      if (lastFilledIndex < length) {
        setTimeout(() => {
          inputRefs.current[lastFilledIndex]?.focus();
        }, 0);
      }
    }
  };

  useEffect(() => {
    // Focus on first empty input when value changes
    const firstEmptyIndex = value.findIndex((char) => !char);
    if (firstEmptyIndex !== -1 && firstEmptyIndex < length) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  }, [value, length]);

  return (
    <div className={cn("flex gap-2", className)} onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <Input
          autoFocus={index === 0}
          className="h-12 w-12 text-center font-mono text-lg"
          inputMode="numeric"
          key={index}
          maxLength={1}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue === "" || /^\d$/.test(newValue)) {
              handleChange(index, newValue);
            }
          }}
          onKeyDown={(e) => handleKeyDown(index, e)}
          pattern="[0-9]"
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          value={value[index] || ""}
          {...props}
        />
      ))}
    </div>
  );
}
