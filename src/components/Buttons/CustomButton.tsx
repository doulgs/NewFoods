import clsx from "clsx";
import { createContext, ReactNode, useContext } from "react";
import { ActivityIndicator, Text, TextProps, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

type Variants = "solid" | "outline" | "ghost";

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variants;
  isLoading?: boolean;
  children: ReactNode;
}

const ThemeContext = createContext<{ variant?: Variants }>({});

function CustomButton({ variant = "solid", children, isLoading = false, className, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      disabled={isLoading || rest.disabled}
      activeOpacity={isLoading ? 1 : 0.7}
      accessibilityRole="button"
      {...rest}
    >
      <View
        className={clsx(
          "flex-1 flex-row items-center justify-center min-h-[50px] px-4 rounded-lg border",
          {
            "bg-primary-800 border-primary-800 text-white": variant === "solid",
            "bg-transparent border-primary-800 text-primary-800": variant === "outline",
            "bg-transparent border-transparent text-primary-800": variant === "ghost",
            "opacity-50": isLoading || rest.disabled, // Indica estado desativado
          },
          className
        )}
      >
        <ThemeContext.Provider value={{ variant }}>
          {isLoading ? <ActivityIndicator color={variant === "solid" ? "#FFFFFF" : "#000000"} /> : children}
        </ThemeContext.Provider>
      </View>
    </TouchableOpacity>
  );
}

function Title({ children, className }: TextProps) {
  const { variant } = useContext(ThemeContext);

  return (
    <Text
      className={clsx(
        "text-lg font-semibold",
        {
          "text-white": variant === "solid",
          "text-primary-800": variant === "outline" || variant === "ghost",
        },
        className
      )}
    >
      {children}
    </Text>
  );
}

CustomButton.Title = Title;

export { CustomButton };
