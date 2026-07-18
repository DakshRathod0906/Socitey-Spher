/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          hover: "rgb(var(--primary-hover) / <alpha-value>)",
          light: "rgb(var(--primary-light) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          hover: "rgb(var(--secondary-hover) / <alpha-value>)",
          light: "rgb(var(--secondary-light) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          light: "rgb(var(--success-light) / <alpha-value>)",
          foreground: "rgb(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          light: "rgb(var(--warning-light) / <alpha-value>)",
          foreground: "rgb(var(--warning-foreground) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          light: "rgb(var(--danger-light) / <alpha-value>)",
          foreground: "rgb(var(--danger-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--info) / <alpha-value>)",
          light: "rgb(var(--info-light) / <alpha-value>)",
          foreground: "rgb(var(--info-foreground) / <alpha-value>)",
        },
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          hover: "rgb(var(--card-hover) / <alpha-value>)",
        },
        text: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        },
        muted: "rgb(var(--muted) / <alpha-value>)",
        placeholder: "rgb(var(--placeholder) / <alpha-value>)",
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          hover: "rgb(var(--border-hover) / <alpha-value>)",
        },
        ring: "rgb(var(--ring) / <alpha-value>)",
        sidebar: {
          DEFAULT: "rgb(var(--sidebar-bg) / <alpha-value>)",
          text: "rgb(var(--sidebar-text) / <alpha-value>)",
          active: "rgb(var(--sidebar-active) / <alpha-value>)",
          "active-bg": "rgb(var(--sidebar-active-bg) / <alpha-value>)",
          hover: "rgb(var(--sidebar-hover) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
    },
  },
  plugins: [],
};
