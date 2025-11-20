import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: number;
    onChange: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState("");

        // Format number with commas
        const formatNumber = (num: number): string => {
            if (!num && num !== 0) return "";
            return num.toLocaleString('ko-KR');
        };

        // Parse formatted string to number
        const parseNumber = (str: string): number => {
            const cleaned = str.replace(/,/g, '');
            const num = parseInt(cleaned, 10);
            return isNaN(num) ? 0 : num;
        };

        // Update display value when prop value changes
        React.useEffect(() => {
            setDisplayValue(formatNumber(value));
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Allow only numbers and commas
            if (inputValue && !/^[\d,]*$/.test(inputValue)) {
                return;
            }

            // Parse and update
            const numericValue = parseNumber(inputValue);
            onChange(numericValue);
            setDisplayValue(formatNumber(numericValue));
        };

        return (
            <Input
                type="text"
                className={cn("text-right", className)}
                value={displayValue}
                onChange={handleChange}
                ref={ref}
                {...props}
            />
        )
    }
)

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
