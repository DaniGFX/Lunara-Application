---
name: lunara-ui-ux
description: Guide for creating lavender-themed mobile interfaces following the LUNARA design system, reusable React Native components, and NativeWind styling.
---

# LUNARA UI/UX Specialist Agent Skill

## Overview & PRD Alignment
This skill governs the visual design, design tokens, layout, styling, and reusable component creation for the **LUNARA** personal finance app according to `docs/LUNARA_PRD.md` (Sections 7, 11, 12).

All UI implementations must strictly respect the calm, minimalist lavender theme and ensure accessible, responsive mobile ergonomics on Android (and future iOS).

---

## 1. Design System Tokens & Color Palette

All screens and components must use the official LUNARA color palette:

| Color Role | Hex Code | NativeWind / Tailwind Class Context | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Lavender** | `#9B87D4` | `bg-[#9B87D4]`, `text-[#9B87D4]` | Main CTA buttons, active tab indicators, primary accents |
| **Light Lavender** | `#EAE3FA` | `bg-[#EAE3FA]`, `border-[#EAE3FA]` | Cards, selected states, pill badges, soft backgrounds |
| **Background** | `#F8F6FC` | `bg-[#F8F6FC]` | Main screen background (calm, soft, low eye strain) |
| **Dark Purple** | `#574477` | `text-[#574477]` | Headings, primary text, prominent figures |
| **White** | `#FFFFFF` | `bg-white`, `text-white` | Card surfaces, container surfaces, input backgrounds |
| **Soft Pink** | `#F5E5F3` | `bg-[#F5E5F3]`, `text-[#F5E5F3]` | Secondary accents, tags, highlight chips |
| **Income Emerald** | `#10B981` | `text-emerald-600`, `bg-emerald-50` | Income figures (must pair with '+' and icon) |
| **Expense Rose** | `#F43F5E` | `text-rose-500`, `bg-rose-50` | Expense figures (must pair with '-' and icon) |
| **Muted Slate** | `#7A7289` | `text-[#7A7289]` | Secondary labels, timestamps, placeholder text |

### Accessibility & Color Rule (PRD §7.2, §11)
- **Never convey meaning through color alone**:
  - Income: Use `#10B981` accompanied by a `+` symbol and an upward arrow or income icon.
  - Expense: Use `#F43F5E` accompanied by a `-` symbol and a downward arrow or expense icon.
  - Budget warnings: Accompany color shifts (amber/rose) with text labels like `"Exceeded by ₱..."` and warning icons.
- Ensure minimum WCAG AA contrast (Dark Purple `#574477` on Light Lavender `#EAE3FA` or Background `#F8F6FC`).

---

## 2. Typography & Spacing Hierarchy

- **Font Family**: Clean sans-serif (System Default or Inter / Roboto).
- **Scale**:
  - Title / Large Balance: `text-3xl font-bold text-[#574477]`
  - Section Headings: `text-xl font-bold text-[#574477]`
  - Card Titles / Subheadings: `text-base font-semibold text-[#574477]`
  - Body Text: `text-sm font-normal text-[#574477]`
  - Secondary / Captions: `text-xs text-[#7A7289]`
- **Touch Targets**: Minimum `48x48 dp` for all interactive elements, buttons, and touchable icons.
- **Card Radius & Elevation**:
  - Rounded corners: `rounded-2xl` (16px) or `rounded-3xl` (24px) for cards.
  - Soft shadow: `shadow-sm` or custom subtle shadow without harsh black elevation.

---

## 3. Application Navigation Structure (PRD §7.3)

Main Tab Navigation (Bottom Bar):
1. **Home**: Dashboard summary, quick actions, balance card, recent transactions, spending overview.
2. **Transactions**: Income/Expense list, filtering (month/category/type), search, detail view.
3. **Budgets**: Monthly budget bars, remaining amount, category limits.
4. **Savings**: Savings targets, visual progress rings/bars, contribution history.
5. **Profile**: User preferences, currency settings (`PHP ₱`), auth state, danger zone.

Modals / Quick Actions:
- Bottom sheet or modal for **Add Transaction** (Quick entry: Amount, Type toggle, Category, Date, Note).
- Modal for **Add / Edit Budget**.
- Modal for **Add Savings Goal & Contribution**.

---

## 4. NativeWind Component Patterns (JavaScript)

### Example: LUNARA Card Surface
```javascript
import React from 'react';
import { View } from 'react-native';

export function LunaraCard({ children, className = '', variant = 'white' }) {
  const bgClass = variant === 'lavender' ? 'bg-[#EAE3FA]' : 'bg-white';
  return (
    <View className={`${bgClass} rounded-2xl p-4 shadow-sm border border-purple-50/50 ${className}`}>
      {children}
    </View>
  );
}
```

### Example: Primary Button
```javascript
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export function LunaraButton({ title, onPress, loading = false, disabled = false, variant = 'primary', className = '' }) {
  const isPrimary = variant === 'primary';
  const baseClasses = "h-12 rounded-xl flex-row items-center justify-center px-5";
  const colorClasses = isPrimary 
    ? (disabled ? "bg-[#9B87D4]/50" : "bg-[#9B87D4] active:bg-[#8670C7]")
    : "bg-[#EAE3FA] active:bg-[#DDD2F5]";
  const textClasses = isPrimary ? "text-white font-semibold text-base" : "text-[#574477] font-semibold text-base";

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading} 
      className={`${baseClasses} ${colorClasses} ${className}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#FFFFFF" : "#574477"} />
      ) : (
        <Text className={textClasses}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
```

---

## 5. UI States & Feedback Standards (PRD §11)

Every screen and form must implement 4 states:
1. **Loading State**: Subtle activity indicators or skeleton cards matching `#EAE3FA`.
2. **Empty State**: Friendly illustration/icon, comforting lavender caption, and a direct CTA (e.g., "No transactions yet this month. Tap '+' to record your first expense.").
3. **Error State**: Informative banner or toast in soft rose (`#FEE2E2`) with clear recovery advice.
4. **Success Feedback**: Clear confirmation on save/update; never assume a save succeeded before database resolution.

Destructive Confirmation:
- Any deletion (category, transaction, budget, goal) **must trigger a confirmation dialog** explaining consequences.

---

## 6. Collaboration Checklist
- Work closely with `react-native-expo-developer` to integrate state and navigation.
- Coordinate with `personal-finance-logic` to display Philippine Peso (`₱`) formatted strings accurately without manual string slicing.

