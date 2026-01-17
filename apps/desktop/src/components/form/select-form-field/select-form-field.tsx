import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";

interface SelectOption {
  /** The value of the option */
  value: string;
  /** The label to display for the option */
  label: string;
}

interface SelectFormFieldProps {
  /** The name of the field to associate with the form */
  name: string;
  /** The label to display for the field */
  label: string;
  /** The placeholder text when no value is selected */
  placeholder?: string;
  /** The default value for the field */
  defaultValue?: string;
  /** The options to display in the select */
  options: SelectOption[];
  /** Optional custom content for the select items */
  children?: ReactNode;
}

/**
 * A form field wrapper for Select component that integrates with react-hook-form.
 * Provides label, validation, and error message handling.
 */
export function SelectFormField({
  name,
  label,
  placeholder,
  defaultValue,
  options,
  children,
}: SelectFormFieldProps) {
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
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="w-full h-11 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:border-primary">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {children ||
                options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
