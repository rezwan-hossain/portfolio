import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  className?: string;
}

const Input: React.FC<InputProps> = ({
  className,
  type = "text",
  ...props
}) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "w-full h-10 px-3 py-2 rounded-md text-base sm:text-sm/6 text-gray-900 bg-white",
        // Placeholder
        "placeholder:text-gray-400",
        // Outline & focus
        "outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-600",
        // Text selection
        "selection:bg-gray-800 selection:text-white",
        // Additional classes
        className,
      )}
      {...props}
    />
  );
};

export default Input;
