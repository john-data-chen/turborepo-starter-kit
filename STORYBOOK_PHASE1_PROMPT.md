# Storybook Phase 1: Expand Component Coverage - Gemini CLI Prompt

## Context
We have successfully integrated Storybook into a turborepo React/TypeScript monorepo structure. The project uses:
- React 19 with TypeScript
- Tailwind CSS 4.x with custom design tokens
- Radix UI components
- Storybook 10.0.6 with Vite builder
- 25+ existing UI components in `packages/ui/src/components/ui/`

## Current Status
✅ **Completed:**
- Storybook 10.0.6 installed and configured
- Basic stories created for: Button, Card, Badge, Input
- Turborepo integration with global scripts
- .gitignore updated for storybook-static
- TypeScript and React 19 support
- Accessibility, themes, and links addons configured

## Task: Phase 1 - Expand Component Story Coverage

### Primary Objective
Create comprehensive Story files for the remaining 20+ UI components in priority order.

### Component Priority List

**High Priority (Week 1):**
1. `alert-dialog.tsx` - Modal alert dialog component
2. `avatar.tsx` - User avatar with image/fallback
3. `checkbox.tsx` - Form checkbox with state management
4. `dialog.tsx` - Generic modal dialog
5. `dropdown-menu.tsx` - Dropdown menu with triggers
6. `form.tsx` - Form wrapper with validation
7. `label.tsx` - Form field labels
8. `popover.tsx` - Floating content panels

**Medium Priority (Week 2):**
9. `select.tsx` - Dropdown selection component
10. `textarea.tsx` - Multi-line text input
11. `calendar.tsx` - Date picker calendar
12. `command.tsx` - Command palette/search
13. `radio-group.tsx` - Radio button groups
14. `scroll-area.tsx` - Custom scrollable areas

**Lower Priority (Week 3):**
15. `breadcrumb.tsx` - Navigation breadcrumbs
16. `collapsible.tsx` - Expandable content sections
17. `sheet.tsx` - Slide-out panels
18. `sidebar.tsx` - Navigation sidebar
19. `skeleton.tsx` - Loading placeholders
20. `tooltip.tsx` - Hover tooltips

### Technical Requirements

**For each component, create:**
1. **Individual Stories:** Basic, variants, states (disabled, loading, etc.)
2. **Overview Stories:** Showcase all variants in one place
3. **Complex Examples:** Real-world usage scenarios
4. **Interactive Controls:** Proper args for all component props
5. **Dark/Light Theme:** Ensure both themes work correctly
6. **Accessibility:** Include proper ARIA labels and roles

**Story Structure Standards:**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './component-name';

const meta: Meta<typeof ComponentName> = {
  title: 'UI/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define control types for each prop
  },
  args: {
    // Default values
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { /* basic usage */ };
export const Variant1: Story = { /* specific variant */ };
export const AllVariants: Story = { /* overview */ };
```

**Component-Specific Requirements:**
- **Dialog/Modal components:** Include overlay, escape key, click-outside
- **Form components:** Show validation states, error messages
- **Interactive components:** Demonstrate hover, focus, active states
- **Data display components:** Show various data states (empty, loading, error)

### Expected Deliverables
- [ ] `.stories.tsx` file for each component
- [ ] All stories properly categorized under `UI/ComponentName`
- [ ] Interactive controls working for all props
- [ ] Both light and dark themes working
- [ ] No TypeScript errors
- [ ] Stories build successfully with `npm run build:storybook`
- [ ] All components follow existing code patterns and conventions

### Quality Standards
- **Consistency:** Follow existing patterns from Button/Card stories
- **Documentation:** Include clear descriptions and usage notes
- **Completeness:** Cover all component variants and edge cases
- **Performance:** Ensure stories load quickly
- **Accessibility:** Test with keyboard navigation and screen readers

### Success Criteria
- All high-priority components have working stories
- Stories integrate seamlessly with existing Storybook
- Component library documentation is comprehensive
- No breaking changes to existing components
- Development workflow remains smooth

### Notes
- Use existing component structure and design tokens
- Leverage existing utility functions from `lib/utils.ts`
- Maintain consistency with established naming conventions
- Consider component dependencies and composition
- Test stories in both development and production builds

**Please proceed with creating stories for the high-priority components first, and work through the list systematically.**