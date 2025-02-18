import { colors } from "@/styles/colors";
import clsx from "clsx";
import React, { useMemo } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Platform, Text, TextInput, TextInputProps, View, ViewProps } from "react-native";

type Variants = "base" | "flat" | "ghost" | "outlined" | "default";

type InputProps = ViewProps & {
  children: React.ReactNode;
  variant?: Variants;
  className?: string;
};

function Input({ children, variant = "base", className, ...rest }: InputProps) {
  return (
    <View
      className={clsx(
        "h-[50px] px-4 rounded-lg flex-row items-center",
        {
          "border border-primary-800 bg-zinc-800": variant === "base",
          "border border-zinc-600 bg-zinc-700": variant === "flat",
          "border-b-2 border-primary-200 bg-zinc-700": variant === "outlined",
          "border p-2 rounded-md": variant === "ghost",
          "border border-zinc-900 bg-zinc-300 rounded-lg": variant === "default",
        },
        className
      )}
      {...rest}
    >
      {children}
    </View>
  );
}

type ControlledInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  className?: string;
  variant?: Variants;
} & TextInputProps;

function ControlledField<T extends FieldValues>({
  variant = "base",
  name,
  control,
  className,
  ...rest
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="w-full">
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            className={clsx(
              "flex-1",
              {
                "text-zinc-100": variant === "flat",
                "text-zinc-200": variant === "outlined",
                "text-zinc-700": variant === "ghost",
                "text-zinc-950 font-semibold": variant === "default",
              },
              className
            )}
            placeholderTextColor={colors.zinc[400]}
            cursorColor={colors.zinc[100]}
            selectionColor={Platform.OS === "ios" ? colors.zinc[100] : undefined}
            onChangeText={(text) => {
              onChange(text);
              rest.onChangeText?.(text);
            }}
            onBlur={(e) => {
              onBlur();
              rest.onBlur?.(e);
            }}
            value={value}
            {...rest}
          />
          {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
        </View>
      )}
    />
  );
}

type MaskedInputProps<T extends FieldValues> = ControlledInputProps<T> & {
  applyMask: (value: string) => string;
  variant?: Variants;
};

function MaskedField<T extends FieldValues>({
  variant = "base",
  name,
  control,
  applyMask,
  className,
  ...rest
}: MaskedInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        // 🛠️ Memoiza a máscara para evitar cálculos desnecessários
        const maskedValue = useMemo(() => applyMask(value ?? ""), [value, applyMask]);

        return (
          <View className="w-full">
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              className={clsx(
                "flex-1",
                {
                  "text-zinc-100": variant === "flat",
                  "text-zinc-200": variant === "outlined",
                  "text-zinc-700": variant === "ghost",
                  "text-zinc-950 font-semibold": variant === "default",
                },
                className
              )}
              placeholderTextColor={colors.zinc[400]}
              cursorColor={colors.zinc[100]}
              selectionColor={Platform.OS === "ios" ? colors.zinc[100] : undefined}
              onChangeText={(text) => {
                const masked = applyMask(text);
                onChange(masked);
                rest.onChangeText?.(masked);
              }}
              onBlur={(e) => {
                onBlur();
                rest.onBlur?.(e);
              }}
              value={maskedValue}
              {...rest}
            />
            {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
          </View>
        );
      }}
    />
  );
}

Input.ControlledField = ControlledField;
Input.MaskedField = MaskedField;

export { Input };
