import * as React from "react";
import { cn } from "@/lib/utils";

function TextInput({ className, ...props }: React.HTMLProps<HTMLInputElement>) {
  return (
    <input {...props} type="text" className={cn("input-text", className)} />
  );
}

export { TextInput };
