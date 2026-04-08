# AdminFoodManager Component

A comprehensive Next.js App Router React component for managing food menu categories and items with full CRUD functionality.

## Features

✅ **React Query Integration**
- Uses `@tanstack/react-query` for data fetching and caching
- Optimistic updates for instant UI feedback
- Automatic query invalidation after mutations

✅ **Full CRUD Operations**
- Create menu categories
- Update menu categories
- Delete menu categories (via context)
- Create menu items
- Update menu items
- Delete menu items

✅ **User Experience**
- Modern dashboard-style UI
- Real-time loading states
- Success/error toast notifications using Sonner
- Split layout: categories on left, items on right
- Responsive design (1 col mobile, 4 cols desktop)

✅ **Data Validation**
- Zod schema validation for both categories and items
- Form validation errors display
- Field-level error messages

✅ **UI Components**
- Dialog modal for category create/edit
- Sheet sidebar for item create/edit
- DataTable for displaying items
- Custom AppField components for consistency
- shadcn/ui Button, Dialog, Sheet components

## Component Location

`src/components/modules/Admin/AdminFoodManager.tsx`

## Usage

```tsx
import AdminFoodManager from '@/components/modules/Admin/AdminFoodManager';

export default function AdminFoodPage() {
  return <AdminFoodManager />;
}
```

## API Integration

The component uses the following `foodService` methods:

```typescript
foodService.getMenu()           // Fetch all categories and items
foodService.createMenuCategory()  // Create a new category
foodService.updateMenuCategory()  // Update a category
foodService.createMenuItem()     // Create a new item
foodService.updateMenuItem()     // Update an item
foodService.deleteMenuItem()     // Delete an item
```

## Form Schemas

### Menu Category Schema
```typescript
{
  name: string (required)              // Category name
  description: string (optional)       // Category description
  imageUrl: string (optional)          // Category image URL
  sortOrder: number                    // Display order
  isActive: boolean                    // Active/inactive status
}
```

### Menu Item Schema
```typescript
{
  name: string (required)              // Item name
  description: string (optional)       // Item description
  price: number (required)             // Base price
  discountedPrice: number (optional)   // Sale price
  categoryId: string (required)        // Parent category
  preparationTime: number (optional)   // Minutes to prepare
  calories: number (optional)          // Calorie count
  isVegetarian: boolean                // Vegetarian flag
  isVegan: boolean                     // Vegan flag
  isGlutenFree: boolean                // Gluten-free flag
  ingredients: string                  // Comma-separated list
  allergens: string                    // Comma-separated list
  isAvailable: boolean                 // Availability status
}
```

## Features in Detail

### Optimistic Updates
All mutations perform optimistic updates:
- UI updates immediately when user takes action
- If request fails, UI automatically reverts
- Background request completes while user sees instant feedback

### Category Management
- **Left Sidebar**: Clickable category list with selection state
- **Add Button**: Opens dialog to create new category
- **Selected State**: Active category highlighted with teal accent
- **Edit/View**: Click category to see its items

### Item Management
- **DataTable Display**: Shows items under selected category
- **Item Rows**: Display name, description, price, discounted price, prep time, and status
- **Edit**: Click edit icon to open sheet form
- **Delete**: Click delete icon with confirmation dialog
- **Add Item**: Creates new item in selected category

### Form Dialogs
- **Category Dialog**: Modal with fields for category creation/editing
- **Item Sheet**: Sidebar form with comprehensive item fields
- **Form Validation**: Real-time error validation and display
- **Loading States**: Submit buttons show loading state during requests

### Toast Notifications
- Success toast on create, update, delete
- Error toast if request fails
- Automatic dismissal

## Styling

Uses the project's existing design system:
- Dark theme (`#0B0C10` background)
- Teal accent color (`#37EFD1`)
- Red for destructive actions (`#C8102E`)
- Tailwind CSS utilities
- Custom theme colors and spacing

## Responsive Behavior

- **Mobile (< lg)**: Single column, categories and items stacked
- **Desktop (>= lg)**: 3-column layout with category sidebar
- **DataTable**: Horizontal scroll on small screens
- **Forms**: Full width on mobile, constrained on desktop

## Dependencies

Required packages (already installed):
- `@tanstack/react-query`: Data fetching and state management
- `sonner`: Toast notifications
- `zod`: Schema validation
- `lucide-react`: Icons (Plus, Edit2, Trash2, ChevronRight)
- `shadcn/ui`: UI components (Dialog, Sheet, Button)
- `tailwindcss`: Styling

## Notes

- The component is fully client-side rendered (`'use client'`)
- Compatible with Next.js App Router
- Uses Server Actions pattern via `foodService`
- Handles TypeScript with full type safety
- Integrates with project's existing QueryProvider

## Styling Note

The component uses the same Tailwind patterns as the rest of the project. Some CSS linting warnings about "BEM naming" may appear - these are style linter preferences and do not affect functionality.
