import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem } from "@/components/shadcn/ui/form";
import { Switch } from "@/components/shadcn/ui/switch";

interface SwitchFormFieldProps
  extends Omit<ComponentProps<typeof Switch>, "name"> {
  /** The name of the field to associate with the form */
  name: string;
}

/**
 * A form field wrapper for Switch component that integrates with react-hook-form.
 * Provides label, validation, and error message handling.
 */
export function SwitchFormField({
  name,
  defaultValue,
  ...switchProps
}: SwitchFormFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              {...switchProps}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
