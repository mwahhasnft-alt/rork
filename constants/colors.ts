// Real Estate App Design System - Inspired by modern property platforms
const primaryLight = "#2563EB"; // Professional blue
const primaryDark = "#3B82F6";
const accentLight = "#F59E0B"; // Premium gold
const accentDark = "#FBBF24";

export default {
  light: {
    // Text Colors
    text: "#0F172A", // Rich dark for primary text
    textSecondary: "#475569", // Medium gray for secondary text
    textTertiary: "#64748B", // Light gray for tertiary text
    textMuted: "#94A3B8", // Very light gray for muted text
    
    // Background Colors
    background: "#FFFFFF", // Pure white background
    backgroundSecondary: "#F8FAFC", // Very light gray background
    backgroundTertiary: "#F1F5F9", // Light gray background
    backgroundElevated: "#FFFFFF", // White for elevated surfaces
    backgroundOverlay: "rgba(15, 23, 42, 0.8)", // Dark overlay
    
    // Brand Colors
    tint: primaryLight,
    tintSecondary: "#1E40AF", // Darker blue
    accent: accentLight,
    accentSecondary: "#D97706", // Darker gold
    
    // Navigation
    tabIconDefault: "#94A3B8",
    tabIconSelected: primaryLight,
    
    // Borders
    border: "#E2E8F0", // Light border
    borderSecondary: "#CBD5E1", // Medium border
    borderTertiary: "#F1F5F9", // Very light border
    
    // Interactive Elements
    placeholder: "#94A3B8",
    input: "#FFFFFF",
    inputBorder: "#E2E8F0",
    inputFocused: primaryLight,
    
    // Status Colors
    success: "#10B981", // Modern green
    warning: accentLight,
    error: "#EF4444", // Modern red
    info: "#3B82F6", // Modern blue
    
    // Card Colors
    card: "#FFFFFF",
    cardSecondary: "#F8FAFC",
    cardElevated: "#FFFFFF",
    
    // Shadow Colors
    shadow: "rgba(15, 23, 42, 0.08)",
    shadowSecondary: "rgba(15, 23, 42, 0.04)",
    shadowElevated: "rgba(15, 23, 42, 0.12)",
    
    // Utility Colors
    destructive: "#EF4444",
    overlay: "rgba(15, 23, 42, 0.6)",
    separator: "#E2E8F0",
    
    // Property Status Colors
    available: "#10B981",
    sold: "#EF4444",
    pending: "#F59E0B",
    featured: "#8B5CF6",
  },
  dark: {
    // Text Colors
    text: "#F8FAFC", // Light text for dark mode
    textSecondary: "#CBD5E1", // Medium light for secondary
    textTertiary: "#94A3B8", // Medium gray for tertiary
    textMuted: "#64748B", // Darker gray for muted
    
    // Background Colors
    background: "#0F172A", // Rich dark background
    backgroundSecondary: "#1E293B", // Lighter dark background
    backgroundTertiary: "#334155", // Medium dark background
    backgroundElevated: "#1E293B", // Elevated surface
    backgroundOverlay: "rgba(15, 23, 42, 0.9)", // Dark overlay
    
    // Brand Colors
    tint: primaryDark,
    tintSecondary: "#60A5FA", // Lighter blue
    accent: accentDark,
    accentSecondary: "#FCD34D", // Lighter gold
    
    // Navigation
    tabIconDefault: "#64748B",
    tabIconSelected: primaryDark,
    
    // Borders
    border: "#334155", // Dark border
    borderSecondary: "#475569", // Medium dark border
    borderTertiary: "#1E293B", // Very dark border
    
    // Interactive Elements
    placeholder: "#64748B",
    input: "#1E293B",
    inputBorder: "#334155",
    inputFocused: primaryDark,
    
    // Status Colors
    success: "#34D399", // Bright green for dark mode
    warning: accentDark,
    error: "#F87171", // Bright red for dark mode
    info: "#60A5FA", // Bright blue for dark mode
    
    // Card Colors
    card: "#1E293B",
    cardSecondary: "#334155",
    cardElevated: "#1E293B",
    
    // Shadow Colors
    shadow: "rgba(0, 0, 0, 0.25)",
    shadowSecondary: "rgba(0, 0, 0, 0.15)",
    shadowElevated: "rgba(0, 0, 0, 0.35)",
    
    // Utility Colors
    destructive: "#F87171",
    overlay: "rgba(15, 23, 42, 0.8)",
    separator: "#334155",
    
    // Property Status Colors
    available: "#34D399",
    sold: "#F87171",
    pending: "#FBBF24",
    featured: "#A78BFA",
  },
  gradients: {
    light: {
      primary: ["#2563EB", "#1E40AF"], // Blue gradient
      secondary: ["#F8FAFC", "#E2E8F0"], // Light gray gradient
      success: ["#10B981", "#059669"], // Green gradient
      warning: ["#F59E0B", "#D97706"], // Amber gradient
      error: ["#EF4444", "#DC2626"], // Red gradient
      accent: ["#F59E0B", "#D97706"], // Gold gradient
      card: ["#FFFFFF", "#F8FAFC"], // Card gradient
      background: ["#FFFFFF", "#F8FAFC"], // Background gradient
      hero: ["#2563EB", "#1E40AF", "#F59E0B"], // Hero gradient
      property: ["#F8FAFC", "#FFFFFF"], // Property card gradient
    },
    dark: {
      primary: ["#3B82F6", "#2563EB"], // Blue gradient
      secondary: ["#1E293B", "#334155"], // Dark gray gradient
      success: ["#34D399", "#10B981"], // Green gradient
      warning: ["#FBBF24", "#F59E0B"], // Amber gradient
      error: ["#F87171", "#EF4444"], // Red gradient
      accent: ["#FBBF24", "#F59E0B"], // Gold gradient
      card: ["#1E293B", "#334155"], // Card gradient
      background: ["#0F172A", "#1E293B"], // Background gradient
      hero: ["#3B82F6", "#2563EB", "#FBBF24"], // Hero gradient
      property: ["#1E293B", "#334155"], // Property card gradient
      elevated: ["#1E293B", "#334155"],
    },
  },
  shadows: {
    light: {
      none: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      small: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      medium: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      },
      large: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      },
      xlarge: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
      },
    },
    dark: {
      none: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      small: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
      },
      medium: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
      },
      large: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
      },
      xlarge: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 10,
      },
    },
  },
};

// Typography System
export const Typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
  },
};

// Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// Border Radius System
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Property Type Colors
export const PropertyColors = {
  apartment: "#2563EB", // Blue
  villa: "#10B981", // Green
  office: "#F59E0B", // Amber
  land: "#8B5CF6", // Purple
  commercial: "#EF4444", // Red
  townhouse: "#06B6D4", // Cyan
  penthouse: "#F59E0B", // Gold
};

// Status Colors
export const StatusColors = {
  available: "#10B981",
  sold: "#EF4444",
  pending: "#F59E0B",
  rented: "#8B5CF6",
  featured: "#F59E0B",
  new: "#06B6D4",
};