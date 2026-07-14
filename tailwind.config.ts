import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        apple: "20px"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15, 23, 42, 0.08)",
        card: "0 10px 28px rgba(15, 23, 42, 0.06)"
      },
      colors: {
        brand: {
          green: "#178F5A",
          greenDark: "#0F7046",
          red: "#B92D32",
          ink: "#141414",
          muted: "#6B7280",
          line: "#E5E7EB",
          canvas: "#F5F6F8"
        }
      }
    }
  },
  plugins: []
};

export default config;
