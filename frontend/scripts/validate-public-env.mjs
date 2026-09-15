import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const requiredVariables = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "NEXT_PUBLIC_CONFIRMATION_PHONE",
  "NEXT_PUBLIC_CONFIRMATION_WINDOW",
  "NEXT_PUBLIC_DISPATCH_WINDOW",
  "NEXT_PUBLIC_DELIVERY_WINDOW",
  "NEXT_PUBLIC_STANDARD_SHIPPING_FEE",
  "NEXT_PUBLIC_FREE_GIFT_NAME",
];

const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

if (missingVariables.length > 0) {
  console.error(`Missing required public build environment variable(s): ${missingVariables.join(", ")}`);
  process.exit(1);
}