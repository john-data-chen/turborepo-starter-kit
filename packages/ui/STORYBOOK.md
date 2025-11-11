# Storybook Documentation

## Overview

This UI kit is integrated with Storybook for component development, testing, and documentation.

## Quick Start

### Development Mode
```bash
# Method 1: Run directly in the UI package
cd packages/ui
pnpm run storybook

# Method 2: Run via Turborepo globally (recommended)
npm run storybook
```
Storybook will start at http://localhost:6006.

### Build Static Files
```bash
# Method 1: Run directly in the UI package
cd packages/ui
pnpm run build-storybook

# Method 2: Run via Turborepo globally (recommended)
npm run build:storybook
```
Static files will be output to the `storybook-static` directory.

### Test Storybook
```bash
# Method 1: Run directly in the UI package
cd packages/ui
pnpm run test-storybook

# Method 2: Run via Turborepo globally (recommended)
npm run test:storybook
```

## Component Coverage

### Components with Stories
- **Alert Dialog**
- **Avatar**
- **Badge**
- **Breadcrumb**
- **Button**
- **Card**
- **Checkbox**
- **Collapsible**
- **Command**
- **Dialog**
- **Dropdown Menu**
- **Input**
- **Label**
- **Popover**
- **Radio Group**
- **Scroll Area**
- **Select**
- **Sheet**
- **Sidebar**
- **Skeleton**
- **Textarea**
- **Tooltip**

### Components without Stories
- **Calendar** (Story removed due to type conflicts with `react-day-picker`)
- **Form** (Story removed due to external dependencies)
- **Separator**

## Story Development Guide

### Creating a New Story File

Create a `*.stories.tsx` file in the corresponding component directory:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './your-component';

const meta: Meta<typeof YourComponent> = {
  title: 'UI/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define controls
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default arguments
  },
};
```

### Naming Conventions
- Story file: `{ComponentName}.stories.tsx`
- Title format: `UI/{ComponentName}`
- Variants use `PascalCase`

## Best Practices

### 1. Document Component Props
Use JSDoc comments to add descriptions for component props:

```typescript
/**
 * A primary button component.
 * @param variant - The button style.
 * @param size - The button size.
 * @param disabled - Whether the button is disabled.
 */
function Button({ variant, size, disabled, ...props }: ButtonProps) {
  // ...
}
```

### 2. Story Organization
- Use clear story categories.
- Provide meaningful descriptions.
- Include usage scenarios.

### 3. Responsive Testing
Test different screen sizes in your stories:
```typescript
export const Responsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
```

### 4. State Management
Provide multiple stories for stateful components:
- Default state
- Loading state
- Error state
- Empty state

## Troubleshooting

### Common Issues

#### 1. Version Conflicts
If you encounter version conflict errors:
```bash
pnpm dedupe
```

#### 2. Build Errors
Check TypeScript configuration:
```bash
# Check for syntax errors
pnpm run type-check
```

#### 3. Style Issues
Ensure global CSS is loaded correctly:
```typescript
// .storybook/preview.ts
import '../src/styles/globals.css';
```

## Turborepo Integration

### Global Scripts
The following scripts have been added to the root `package.json`:
- `npm run storybook` - Starts the Storybook development server.
- `npm run build:storybook` - Builds the Storybook static files.
- `npm run test:storybook` - Runs Storybook tests.

### Turbo.json Configuration
The following tasks have been configured in `turbo.json`:
- `storybook` - Development mode, with caching and dependency management.
- `build-storybook` - Build task, outputting to `storybook-static/`.
- `test-storybook` - Test task.

## Future Plans

### Short-Term Goals
- [x] Create stories for the remaining 20+ components.
- [ ] Add interactive tests.
- [ ] Set up Chromatic for visual regression testing.

### Long-Term Goals
- [x] Integrate into the Turborepo architecture.
- [ ] Integrate into the CI/CD pipeline.
- [ ] Create a component usage guide.
- [ ] Add a design token showcase.
- [ ] Establish a Storybook test suite.
