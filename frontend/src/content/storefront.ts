const required = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
};

export const storefront = {
  whatsappNumber: () => required(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, "NEXT_PUBLIC_WHATSAPP_NUMBER"),
  confirmationPhone: () => required(process.env.NEXT_PUBLIC_CONFIRMATION_PHONE, "NEXT_PUBLIC_CONFIRMATION_PHONE"),
  confirmationWindow: () => required(process.env.NEXT_PUBLIC_CONFIRMATION_WINDOW, "NEXT_PUBLIC_CONFIRMATION_WINDOW"),
  dispatchWindow: () => required(process.env.NEXT_PUBLIC_DISPATCH_WINDOW, "NEXT_PUBLIC_DISPATCH_WINDOW"),
  deliveryWindow: () => required(process.env.NEXT_PUBLIC_DELIVERY_WINDOW, "NEXT_PUBLIC_DELIVERY_WINDOW"),
  shippingFee: () => Number(required(process.env.NEXT_PUBLIC_STANDARD_SHIPPING_FEE, "NEXT_PUBLIC_STANDARD_SHIPPING_FEE")),
  freeGiftName: () => required(process.env.NEXT_PUBLIC_FREE_GIFT_NAME, "NEXT_PUBLIC_FREE_GIFT_NAME"),
} as const;