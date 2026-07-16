/**
 * Colores de la aplicación Workflow Academy
 * Centralizados para facilitar cambios de tema y mantenimiento.
 */

// ── Colores Primarios ──
export const COLORS = {
  // Gradiente principal
  primary: '#7c3aed',      // purple-600
  secondary: '#2563eb',    // blue-600
  
  // Variantes de primary
  primaryLight: 'rgba(124, 58, 237, 0.08)',
  primaryLighter: 'rgba(124, 58, 237, 0.04)',
  primaryBorder: 'rgba(124, 58, 237, 0.2)',
  primaryBorderLight: 'rgba(124, 58, 237, 0.1)',
  
  // Gradientes
  gradientPrimary: 'linear-gradient(135deg, #7c3aed, #2563eb)',
  gradientPrimaryHover: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.15))',
  
  // ── Colores Neutros ──
  // Textos
  textPrimary: '#0f172a',    // slate-900
  textSecondary: '#334155',  // slate-700
  textTertiary: '#64748b',   // slate-500
  textQuaternary: '#94a3b8', // slate-400
  textQuinary: '#cbd5e1',    // slate-300
  
  // Fondos
  bgPrimary: '#0f172a',      // slate-900
  bgSecondary: '#f8fafc',    // slate-50
  bgTertiary: '#f1f5f9',     // slate-100
  bgQuaternary: '#ffffff',   // white
  
  // Bordes
  borderPrimary: '#e2e8f0',  // slate-200
  borderSecondary: '#f1f5f9', // slate-100
  borderTertiary: 'rgba(255, 255, 255, 0.06)',
  
  // ── Estados ──
  success: '#10b981',        // emerald-500
  successLight: '#ecfdf5',   // emerald-50
  successBorder: '#a7f3d0',  // emerald-200
  successText: '#059669',    // emerald-600
  
  warning: '#f59e0b',        // amber-500
  warningLight: '#fef3c7',   // amber-100
  warningBorder: '#fde68a',  // amber-200
  warningText: '#d97706',    // amber-600
  
  error: '#ef4444',          // red-500
  errorLight: 'rgba(248, 113, 113, 0.08)',
  errorBorder: 'rgba(248, 113, 113, 0.2)',
  errorText: '#dc2626',      // red-600
  
  info: '#2563eb',           // blue-600
  
  // ── Sombras ──
  shadowSm: '0 1px 3px rgba(0, 0, 0, 0.05)',
  shadowMd: '0 1px 3px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 8px 24px rgba(15, 23, 42, 0.12)',
} as const;

// ── Tipos exportados ──
export type ColorKey = keyof typeof COLORS;