import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEEDFE",
          100: "#CECBF6",
          200: "#AFA9EC",
          400: "#7F77DD",
          500: "#534AB7",
          600: "#4A3F9F",
          800: "#3C3489",
          900: "#26215C",
        },
        price: { DEFAULT: "#854F0B", bg: "#FAEEDA" },
        up: "#A32D2D",
        upBg: "#FCEBEB",
        down: "#3B6D11",
        downBg: "#EAF3DE",
        stone: {
          50: "#F7F6F2",
          100: "#F1EFE8",
          200: "#D3D1C7",
          400: "#888780",
          600: "#5F5E5A",
          800: "#444441",
          900: "#2C2C2A",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: { md: "8px", lg: "12px" },
    },
  },
  plugins: [],
};
export default config;
