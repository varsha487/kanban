import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#546B41",
        secondary: "#99AD7A",
        accent: "#DCCCAC",
        background: "#FFF8EC",
      },
    },
  },
  plugins: [],
};

export default config;