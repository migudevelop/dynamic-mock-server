import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/ui/form";
import { Input } from "@/components/shadcn/ui/input";

interface InputFormFieldProps
  extends Omit<ComponentProps<typeof Input>, "name"> {
  /** The name of the field to associate with the form */
  name: string;
  /** The label to display for the field */
  label: string;
  /** The default value for the field */
  defaultValue?: string;
}

/**
 * A form field wrapper for Input component that integrates with react-hook-form.
 * Provides label, validation, and error message handling.
 */
export function InputFormField({
  name,
  label,
  defaultValue,
  ...inputProps
}: InputFormFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              className="w-full h-11  rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-primary"
              {...inputProps}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
