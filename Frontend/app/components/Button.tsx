import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends HTMLMotionProps<"button"> {
    isLoading?: boolean;
    variant?: "primary" | "secondary" | "outline";
}

type VariantType = "primary" | "secondary" | "outline";

/*
Button
This component renders a customizable button that can display a loading state. 
It accepts props for the button's variant (primary, secondary, or outline), whether it is currently loading, and any additional HTML button attributes.
The button uses framer-motion for smooth animations on hover and tap, and it conditionally renders a loading spinner when the isLoading prop is true. 
The button is also disabled when it is in the loading state or when the disabled prop is set, preventing user interaction during those times.
*/
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { isLoading = false, children, disabled, type = "button", variant = "primary" as VariantType, className = "", ...rest },
    ref,
) {
    const baseStyles = "relative w-full rounded-4xl font-bold text-xl p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden";

    const variants = {
        primary: "bg-primary text-white shadow-lg shadow-primary/25 border-none",
        secondary: "bg-gray text-foreground border border-white",
        outline: "bg-transparent border-1 border-dark text-dark"
    };

    return (
        <motion.button
            ref={ref}
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...rest}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}
        </motion.button>
    );
});

export default Button;