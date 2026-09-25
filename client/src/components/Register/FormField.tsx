import type { ComponentProps, ReactNode } from "react";

import FieldError from "./FieldError";

const inputClassName =
  "mt-1 w-full rounded-md border border-focus-line/50 bg-base-200 md:bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition placeholder:text-base-content/30 focus:border-warning focus:ring-1 focus:ring-warning";

const labelClassName = "block text-xs font-medium text-base-content/70";

interface FormFieldProps extends Omit<ComponentProps<"input">, "id"> {
  id: string;
  label: string;
  error?: string;
  children?: ReactNode;
}

function FormField({
  id,
  label,
  error,
  className,
  children,
  type = "text",
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hasError = error !== undefined;

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>

      <div className="relative">
        <input
          {...inputProps}
          id={id}
          name={id}
          type={type}
          className={
            className ? `${inputClassName} ${className}` : inputClassName
          }
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        />

        {children}
      </div>

      <FieldError id={errorId} message={error} />
    </div>
  );
}

export default FormField;
