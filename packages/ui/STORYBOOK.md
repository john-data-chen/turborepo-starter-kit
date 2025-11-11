# Storybook 文檔

## 概述

本 UI 套件已成功整合 Storybook，用於組件開發、測試和文檔化。

## 快速開始

### 開發模式
```bash
cd packages/ui
pnpm run storybook
```
Storybook 將在 http://localhost:6006 啟動

### 建構靜態文件
```bash
cd packages/ui
pnpm run build-storybook
```
靜態文件將輸出到 `storybook-static` 目錄

### 測試 Storybook
```bash
cd packages/ui
pnpm run test-storybook
```

## 可用組件

### 已建立 Story 的組件
- **Button** - 各種樣式和尺寸的按鈕
- **Card** - 卡片容器組件

### 現有組件（待建立 Story）
- Alert Dialog
- Avatar
- Badge
- Breadcrumb
- Calendar
- Checkbox
- Collapsible
- Command
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Popover
- Radio Group
- Scroll Area
- Select
- Separator
- Sheet
- Sidebar
- Skeleton
- Textarea
- Tooltip

## Story 開發指南

### 創建新的 Story 文件

在對應組件目錄中創建 `*.stories.tsx` 文件：

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
    // 定義控制項
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // 預設參數
  },
};
```

### Story 命名規範
- 組件文件：`{ComponentName}.stories.tsx`
- 標題格式：`UI/{ComponentName}`
- 多個變體使用 `PascalCase`

### 常用配置

#### Layout 選項
- `'centered'` - 居中顯示
- `'fullscreen'` - 全螢幕顯示
- `'padded'` - 內邊距顯示

#### 變體展示
```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {/* 展示所有變體 */}
    </div>
  ),
};
```

#### Dark Mode 測試
Storybook 自動支援 dark/light theme 切換，確保組件在兩種模式下都正常顯示。

#### Accessibility 測試
使用內建的 Accessibility addon 檢查組件無障礙性。

## Addons 說明

### 已啟用的 Addons
- **@storybook/addon-links** - 組件間連結
- **@storybook/addon-themes** - 主題切換
- **@storybook/addon-a11y** - 無障礙性檢查

### 移除的 Addons
- ~~@storybook/addon-essentials~~ - 因版本衝突暫時移除
- ~~@storybook/addon-interactions~~ - 因版本衝突暫時移除

## 最佳實踐

### 1. 組件 Props 文檔
使用 JSDoc 註釋為組件 props 添加說明：

```typescript
/**
 * 主要的按鈕組件
 * @param variant - 按鈕樣式
 * @param size - 按鈕大小
 * @param disabled - 是否禁用
 */
function Button({ variant, size, disabled, ...props }: ButtonProps) {
  // ...
}
```

### 2. Story 分類
- 使用清晰的故事分類
- 提供有意義的描述
- 包含使用場景說明

### 3. 響應式測試
在 Story 中測試不同螢幕尺寸：
```typescript
export const Responsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
```

### 4. 狀態管理
為有狀態的組件提供多個 Story：
- Default state
- Loading state
- Error state
- Empty state

## 故障排除

### 常見問題

#### 1. 版本衝突
如果遇到版本衝突錯誤：
```bash
pnpm dedupe
```

#### 2. 構建錯誤
檢查 TypeScript 配置：
```bash
# 檢查語法
pnpm run type-check
```

#### 3. 樣式問題
確保全局 CSS 正確載入：
```typescript
// .storybook/preview.ts
import '../src/styles/globals.css';
```

## 未來計劃

### 短期目標
- [ ] 為其餘 20+ 組件建立 Story
- [ ] 加入互動式測試
- [ ] 設置 Chromatic 進行視覺回歸測試

### 長期目標
- [ ] 整合到 CI/CD 流程
- [ ] 建立組件使用指南
- [ ] 添加設計令牌展示
- [ ] 建立 Story 測試套件

## 相關資源

- [Storybook 官方文檔](https://storybook.js.org/)
- [React Storybook 指南](https://storybook.js.org/docs/react/get-started/introduction)
- [UI 組件設計模式](https://storybook.js.org/design-system/)