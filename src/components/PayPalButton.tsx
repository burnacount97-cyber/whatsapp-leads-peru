import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

interface PayPalButtonProps {
    amount: string;
    currency?: string;
    onSuccess: (details: any) => void;
}

export function PayPalPaymentButton({ amount, currency = "USD", onSuccess }: PayPalButtonProps) {
    const { theme } = useTheme();
    const [isLoaded, setIsLoaded] = useState(false);

    const initialOptions = {
        clientId: "test", // Replace with your actual Live Client ID when ready
        currency: currency,
        intent: "capture",
    };

    return (
        <div className="w-full max-w-md mx-auto z-0 relative">
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{
                        layout: "vertical",
                        color: theme === 'dark' ? 'gold' : 'blue',
                        shape: "rect",
                        label: "subscribe"
                    }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: currency,
                                        value: amount,
                                    },
                                    description: "Lead Widget Pro Subscription"
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        if (actions.order) {
                            const details = await actions.order.capture();
                            onSuccess(details);
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        // You might want to show a toast here
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
}
