# Guía de Estilos — Workflow Academy

## Principios

- **Tailwind primero**: Preferir clases utilitarias de Tailwind sobre estilos inline.
- **Consistencia**: Usar la misma paleta y patrones en todo el proyecto.
- **Mantenibilidad**: Centralizar colores y espaciados en `tailwind.config.js` cuando sea posible.

---

## Paleta de Colores

### Primarios
- `purple-600` / `#7c3aed` — Color principal, botones, enlaces activos.
- `blue-600` / `#2563eb` — Secundario, gradientes.

### Neutros (fondos y textos)
- `slate-900` / `#0f172a` — Texto principal, títulos.
- `slate-700` / `#334155` — Texto secundario.
- `slate-500` / `#64748b` — Texto terciario, descripciones.
- `slate-400` / `#94a3b8` — Placeholders, hints.
- `slate-100` / `#f1f5f9` — Bordes sutiles.
- `slate-50`  / `#f8fafc` — Fondos alternos.

### Estados
- `emerald-500` / `#10b981` — Éxito, activo.
- `amber-500`   / `#f59e0b` — Advertencia, en revisión.
- `red-500`     / `#ef4444` — Error, peligro.

---

## Mapeo de Estilos Inline → Tailwind

| Estilo inline | Clase Tailwind |
|---------------|----------------|
| `style={{ color: '#0f172a' }}` | `text-slate-900` |
| `style={{ color: '#334155' }}` | `text-slate-700` |
| `style={{ color: '#64748b' }}` | `text-slate-500` |
| `style={{ color: '#94a3b8' }}` | `text-slate-400` |
| `style={{ color: '#7c3aed' }}` | `text-purple-600` |
| `style={{ color: '#2563eb' }}` | `text-blue-600` |
| `style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}` | `bg-gradient-to-br from-purple-600 to-blue-600` |
| `style={{ border: '1px solid #f1f5f9' }}` | `border border-slate-100` |
| `style={{ border: '1px solid rgba(124,58,237,0.2)' }}` | `border border-purple-200` |
| `style={{ background: 'rgba(124,58,237,0.08)' }}` | `bg-purple-50` |
| `style={{ background: '#f8fafc' }}` | `bg-slate-50` |
| `style={{ background: '#0f172a' }}` | `bg-slate-900` |
| `style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}` | `shadow-sm` |
| `style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}` | `shadow-sm` |

---

## Patrones Comunes

### Tarjeta
```tsx
<div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
  {/* contenido */}
</div>
```

### Badge de estado
```tsx
<span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
  Activo
</span>
```

### Botón primario
```tsx
<button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-purple-600 to-blue-600 hover:opacity-90 transition-all">
  Guardar
</button>
```

### Avatar con iniciales
```tsx
<div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold bg-gradient-to-br from-purple-600 to-blue-600">
  {initials}
</div>
```

### Input
```tsx
<input className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all" />
```

---

## Checklist de Migración

- [ ] Reemplazar `style={{ color: ... }}` por clases `text-*`
- [ ] Reemplazar `style={{ background: ... }}` por clases `bg-*` o `bg-gradient-*`
- [ ] Reemplazar `style={{ border: ... }}` por clases `border border-*`
- [ ] Reemplazar `style={{ boxShadow: ... }}` por clases `shadow-*`
- [ ] Verificar contraste y accesibilidad
- [ ] Probar en modo oscuro si aplica

---

## Notas

- Los gradientes personalizados que no estén en Tailwind por defecto se pueden agregar en `tailwind.config.js` bajo `theme.extend.backgroundImage`.
- Para colores con opacidad (rgba), usar la notación de Tailwind: `bg-purple-600/10`, `border-purple-200`, etc.
- Evitar estilos inline dinámicos cuando sea posible; usar clases condicionales en su lugar.