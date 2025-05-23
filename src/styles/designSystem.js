// Design System Tokens
export const colors = {
  // Primary Colors
  primary: {
    main: "#2563EB", // Blue
    light: "#60A5FA",
    dark: "#1E40AF",
  },
  // Secondary Colors
  secondary: {
    main: "#64748B", // Gray
    light: "#94A3B8",
    dark: "#475569",
  },
  // Status Colors
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  // Background Colors
  background: {
    default: "#F8FAFC",
    paper: "#FFFFFF",
    sidebar: "#1E293B",
  },
  // Text Colors
  text: {
    primary: "#1E293B",
    secondary: "#64748B",
    disabled: "#94A3B8",
    white: "#FFFFFF",
  },
  // Border Colors
  border: {
    light: "#E2E8F0",
    main: "#CBD5E1",
    dark: "#94A3B8",
  },
};

export const typography = {
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  h1: {
    fontSize: "2.5rem",
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h4: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.2,
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.5,
    textTransform: "none",
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
};

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  xxl: "3rem", // 48px
};

export const breakpoints = {
  xs: "0px",
  sm: "600px",
  md: "900px",
  lg: "1200px",
  xl: "1536px",
};

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
};

export const borderRadius = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
};

// Common component styles
export const components = {
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.paper,
    boxShadow: shadows.sm,
  },
  button: {
    primary: {
      backgroundColor: colors.primary.main,
      color: colors.text.white,
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: borderRadius.md,
      "&:hover": {
        backgroundColor: colors.primary.dark,
      },
    },
    secondary: {
      backgroundColor: colors.background.paper,
      color: colors.text.primary,
      border: `1px solid ${colors.border.main}`,
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: borderRadius.md,
      "&:hover": {
        backgroundColor: colors.background.default,
      },
    },
  },
  input: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border.main}`,
    "&:focus": {
      borderColor: colors.primary.main,
      outline: "none",
    },
  },
};
