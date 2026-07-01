'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { z } from 'zod';

import { foodService } from '@/service/food.service';
import { MenuCategory, MenuItem } from '@/types';
import DataTable from '@/components/shared/table/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import AppField from '@/components/shared/form/AppField';
import { cn } from '@/lib/utils';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const MenuCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  sortOrder: z.number().min(0, 'Sort order must be positive'),
  isActive: z.boolean(),
});

const MenuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  discountedPrice: z.number().min(0, 'Discounted price must be positive').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  preparationTime: z.number().min(0, 'Preparation time must be positive').optional(),
  calories: z.number().min(0, 'Calories must be positive').optional(),
  isVegetarian: z.boolean(),
  isVegan: z.boolean(),
  isGlutenFree: z.boolean(),
  ingredients: z.string(),
  allergens: z.string(),
  isAvailable: z.boolean(),
});

type MenuCategoryInput = z.infer<typeof MenuCategorySchema>;
type MenuItemInput = z.infer<typeof MenuItemSchema>;

// ============================================================================
// TYPES
// ============================================================================

interface ValidationErrors {
  [key: string]: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminFoodManager() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemSheetOpen, setItemSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<(MenuCategory & { id: string }) | null>(null);
  const [editingItem, setEditingItem] = useState<(MenuItem & { id: string }) | null>(null);

  const queryClient = useQueryClient();

  const normalizeMenuData = (response: any) => {
    const payload = response?.data?.data ?? response?.data ?? response;
    if (Array.isArray(payload)) {
      return {
        categories: payload,
        items: payload.flatMap((cat: any) => cat.menuItems || []),
      };
    }
    if (payload?.categories || payload?.items) {
      return {
        categories: payload.categories || [],
        items: payload.items || [],
      };
    }
    return { categories: [], items: [] };
  };

  // ============================================================================
  // QUERIES
  // ============================================================================

  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
  } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => normalizeMenuData(await foodService.getMenu()),
  });
  console.log(menuData)

  const categories = menuData?.categories || [];
  const allItems = menuData?.items || [];
  const selectedItems = selectedCategoryId
    ? allItems.filter((item: MenuItem) => item.categoryId === selectedCategoryId)
    : [];

  // ============================================================================
  // MUTATIONS - CATEGORIES
  // ============================================================================

  const createCategoryMutation = useMutation({
    mutationFn: (data: MenuCategoryInput) => foodService.createMenuCategory(data),
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ['menu'] });
      const previousData = queryClient.getQueryData(['menu']);

      queryClient.setQueryData(['menu'], (old: any) => ({
        ...old,
        categories: [
          ...(old?.categories || []),
          { id: Date.now().toString(), ...newCategory },
        ],
      }));

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Category created successfully');
      setCategoryDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (error, _, context: any) => {
      queryClient.setQueryData(['menu'], context?.previousData);
      toast.error('Failed to create category');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MenuCategoryInput }) =>
      foodService.updateMenuCategory(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['menu'] });
      const previousData = queryClient.getQueryData(['menu']);

      queryClient.setQueryData(['menu'], (old: any) => ({
        ...old,
        categories: old?.categories?.map((cat: any) =>
          cat.id === id ? { ...cat, ...data } : cat
        ),
      }));

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Category updated successfully');
      setEditingCategory(null);
      setCategoryDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (error, _, context: any) => {
      queryClient.setQueryData(['menu'], context?.previousData);
      toast.error('Failed to update category');
    },
  });

  // ============================================================================
  // MUTATIONS - ITEMS
  // ============================================================================

  const createItemMutation = useMutation({
    mutationFn: (data: any) => foodService.createMenuItem(data),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['menu'] });
      const previousData = queryClient.getQueryData(['menu']);

      queryClient.setQueryData(['menu'], (old: any) => ({
        ...old,
        items: [
          ...(old?.items || []),
          { id: Date.now().toString(), ...newItem },
        ],
      }));

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Item created successfully');
      setItemSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (error, _, context: any) => {
      queryClient.setQueryData(['menu'], context?.previousData);
      toast.error('Failed to create item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      foodService.updateMenuItem(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['menu'] });
      const previousData = queryClient.getQueryData(['menu']);

      queryClient.setQueryData(['menu'], (old: any) => ({
        ...old,
        items: old?.items?.map((item: any) =>
          item.id === id ? { ...item, ...data } : item
        ),
      }));

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Item updated successfully');
      setEditingItem(null);
      setItemSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (error, _, context: any) => {
      queryClient.setQueryData(['menu'], context?.previousData);
      toast.error('Failed to update item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => foodService.deleteMenuItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['menu'] });
      const previousData = queryClient.getQueryData(['menu']);

      queryClient.setQueryData(['menu'], (old: any) => ({
        ...old,
        items: old?.items?.filter((item: any) => item.id !== id),
      }));

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (error, _, context: any) => {
      queryClient.setQueryData(['menu'], context?.previousData);
      toast.error('Failed to delete item');
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateCategory = (formData: MenuCategoryInput) => {
    createCategoryMutation.mutate(formData);
  };

  const handleUpdateCategory = (formData: MenuCategoryInput) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: formData,
      });
    }
  };

  const handleCreateItem = (formData: any) => {
    const processedData = {
      ...formData,
      ingredients: formData.ingredients.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      allergens: formData.allergens.split(',').map((s: string) => s.trim()).filter((s: string) => s),
    };
    createItemMutation.mutate(processedData);
  };

  const handleUpdateItem = (formData: any) => {
    if (editingItem) {
      const processedData = {
        ...formData,
        ingredients: typeof formData.ingredients === 'string'
          ? formData.ingredients.split(',').map((s: string) => s.trim()).filter((s: string) => s)
          : formData.ingredients,
        allergens: typeof formData.allergens === 'string'
          ? formData.allergens.split(',').map((s: string) => s.trim()).filter((s: string) => s)
          : formData.allergens,
      };
      updateItemMutation.mutate({
        id: editingItem.id,
        data: processedData,
      });
    }
  };

  const handleEditCategory = (category: MenuCategory & { id: string }) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem & { id: string }) => {
    setEditingItem(item);
    setItemSheetOpen(true);
  };

  const handleDeleteItem = (item: MenuItem & { id: string }) => {
    if (confirm(`Delete item "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleCloseDialogs = () => {
    setEditingCategory(null);
    setEditingItem(null);
    setCategoryDialogOpen(false);
    setItemSheetOpen(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Food Menu Manager</h1>
        <p className="text-white/60">Manage menu categories and items</p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Categories</h2>
            <CategoryDialog
              isOpen={categoryDialogOpen}
              onOpenChange={(open) => {
                setCategoryDialogOpen(open);
                if (!open) handleCloseDialogs();
              }}
              onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
              initialData={editingCategory || undefined}
              isLoading={
                createCategoryMutation.isPending || updateCategoryMutation.isPending
              }
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {menuLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded skeleton"
                />
              ))
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-sm">No categories</div>
            ) : (
              categories.map((category: MenuCategory & { id: string }) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between',
                    selectedCategoryId === category.id
                      ? 'bg-[#37EFD1]/10 border-[#37EFD1]/50 text-[#37EFD1]'
                      : 'border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5'
                  )}
                >
                  <span className="truncate text-sm font-medium">{category.name}</span>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Content - Items */}
        <div className="lg:col-span-3 space-y-4">
          {selectedCategoryId ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                  Items ({selectedItems.length})
                </h2>
                <ItemSheet
                  isOpen={itemSheetOpen}
                  onOpenChange={(open) => {
                    setItemSheetOpen(open);
                    if (!open) handleCloseDialogs();
                  }}
                  onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  initialData={editingItem || undefined}
                  isLoading={
                    createItemMutation.isPending || updateItemMutation.isPending
                  }
                />
              </div>

              <ItemsDataTable
                items={selectedItems}
                loading={menuLoading}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onEditClick={() => setItemSheetOpen(true)}
                isDeleting={deleteItemMutation.isPending}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-96 border border-white/10 rounded-lg">
              <div className="text-center">
                <p className="text-white/60">Select a category to view items</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MenuCategoryInput) => void;
  initialData?: MenuCategory & { id: string };
  isLoading: boolean;
}

function CategoryDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: CategoryDialogProps) {
  const [formData, setFormData] = useState<MenuCategoryInput>(
    initialData || {
      name: '',
      description: '',
      imageUrl: '',
      sortOrder: 0,
      isActive: true,
    }
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (field: keyof MenuCategoryInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = () => {
    try {
      const validatedData = MenuCategorySchema.parse(formData);
      onSubmit(validatedData);
      // Reset form on successful submit
      if (!initialData) {
        setFormData({
          name: '',
          description: '',
          imageUrl: '',
          sortOrder: 0,
          isActive: true,
        });
      }
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        (error as any).errors.forEach((err: any) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-[#37EFD1] text-black hover:bg-[#37EFD1]/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0B0C10] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initialData ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <AppField
            label="Category Name"
            id="name"
            error={errors.name}
            required
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Breakfast"
            />
          </AppField>

          <AppField label="Description" id="description" error={errors.description}>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description"
              className="resize-none"
              rows={3}
            />
          </AppField>

          <AppField
            label="Image URL"
            id="imageUrl"
            error={errors.imageUrl}
          >
            <input
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </AppField>

          <AppField
            label="Sort Order"
            id="sortOrder"
            error={errors.sortOrder}
          >
            <input
              type="number"
              min="0"
              value={formData.sortOrder}
              onChange={(e) => handleChange('sortOrder', parseInt(e.target.value))}
            />
          </AppField>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="w-4 h-4 rounded accent-[#37EFD1]"
            />
            <label htmlFor="isActive" className="text-white/70 text-sm">
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#37EFD1] text-black hover:bg-[#37EFD1]/90"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ItemSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  categories: (MenuCategory & { id: string })[];
  selectedCategoryId: string;
  initialData?: MenuItem & { id: string };
  isLoading: boolean;
}

function ItemSheet({
  isOpen,
  onOpenChange,
  onSubmit,
  categories,
  selectedCategoryId,
  initialData,
  isLoading,
}: ItemSheetProps) {
  const [formData, setFormData] = useState<any>(
    initialData || {
      name: '',
      description: '',
      price: 0,
      discountedPrice: 0,
      categoryId: selectedCategoryId,
      preparationTime: 0,
      calories: 0,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      ingredients: '',
      allergens: '',
      isAvailable: true,
    }
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = () => {
    try {
      const validatedData = MenuItemSchema.parse(formData);
      onSubmit(validatedData);
      // Reset form on successful submit
      if (!initialData) {
        setFormData({
          name: '',
          description: '',
          price: 0,
          discountedPrice: 0,
          categoryId: selectedCategoryId,
          preparationTime: 0,
          calories: 0,
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          ingredients: '',
          allergens: '',
          isAvailable: true,
        });
      }
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        (error as any).errors.forEach((err: any) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          className="bg-[#37EFD1] text-black hover:bg-[#37EFD1]/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-[#0B0C10] border-white/10 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">
            {initialData ? 'Edit Item' : 'Create Item'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <AppField label="Item Name" id="name" error={errors.name} required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Eggs Benedict"
            />
          </AppField>

          <AppField label="Description" id="description" error={errors.description}>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description"
              className="resize-none"
              rows={3}
            />
          </AppField>

          <AppField
            label="Category"
            id="categoryId"
            error={errors.categoryId}
            required
          >
            <select
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </AppField>

          <div className="grid grid-cols-2 gap-4">
            <AppField label="Price" id="price" error={errors.price} required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
              />
            </AppField>

            <AppField
              label="Discounted Price"
              id="discountedPrice"
              error={errors.discountedPrice}
            >
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discountedPrice || ''}
                onChange={(e) => handleChange('discountedPrice', parseFloat(e.target.value))}
              />
            </AppField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AppField
              label="Prep Time (min)"
              id="preparationTime"
              error={errors.preparationTime}
            >
              <input
                type="number"
                min="0"
                value={formData.preparationTime || ''}
                onChange={(e) => handleChange('preparationTime', parseInt(e.target.value))}
              />
            </AppField>

            <AppField label="Calories" id="calories" error={errors.calories}>
              <input
                type="number"
                min="0"
                value={formData.calories || ''}
                onChange={(e) => handleChange('calories', parseInt(e.target.value))}
              />
            </AppField>
          </div>

          <AppField label="Ingredients" id="ingredients" error={errors.ingredients}>
            <textarea
              value={formData.ingredients}
              onChange={(e) => handleChange('ingredients', e.target.value)}
              placeholder="Comma-separated list (e.g., eggs, butter, bread)"
              className="resize-none"
              rows={3}
            />
          </AppField>

          <AppField label="Allergens" id="allergens" error={errors.allergens}>
            <textarea
              value={formData.allergens}
              onChange={(e) => handleChange('allergens', e.target.value)}
              placeholder="Comma-separated list (e.g., dairy, nuts)"
              className="resize-none"
              rows={2}
            />
          </AppField>

          <div className="space-y-3">
            <p className="text-white/50 text-[10px] font-sans uppercase tracking-widest">
              Dietary Info
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => handleChange('isVegetarian', e.target.checked)}
                  className="w-4 h-4 rounded accent-[#37EFD1]"
                />
                <span className="text-white/70 text-sm">Vegetarian</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVegan}
                  onChange={(e) => handleChange('isVegan', e.target.checked)}
                  className="w-4 h-4 rounded accent-[#37EFD1]"
                />
                <span className="text-white/70 text-sm">Vegan</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGlutenFree}
                  onChange={(e) => handleChange('isGlutenFree', e.target.checked)}
                  className="w-4 h-4 rounded accent-[#37EFD1]"
                />
                <span className="text-white/70 text-sm">Gluten Free</span>
              </label>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => handleChange('isAvailable', e.target.checked)}
              className="w-4 h-4 rounded accent-[#37EFD1]"
            />
            <span className="text-white/70 text-sm">Available</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#37EFD1] text-black hover:bg-[#37EFD1]/90"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ItemsDataTableProps {
  items: (MenuItem & { id: string })[];
  loading: boolean;
  onEdit: (item: MenuItem & { id: string }) => void;
  onDelete: (item: MenuItem & { id: string }) => void;
  onEditClick: () => void;
  isDeleting: boolean;
}

function ItemsDataTable({
  items,
  loading,
  onEdit,
  onDelete,
  onEditClick,
  isDeleting,
}: ItemsDataTableProps) {
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (value: any, row: MenuItem & { id: string }) => (
        <div className="space-y-1">
          <p className="font-medium text-white">{value}</p>
          {row.description && (
            <p className="text-xs text-white/50 line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (value: any, row: MenuItem & { id: string }) => (
        <div className="space-y-1">
          <p className="font-medium text-white">${value}</p>
          {row.discountedPrice && (
            <p className="text-xs text-[#37EFD1]">${row.discountedPrice}</p>
          )}
        </div>
      ),
    },
    {
      key: 'preparationTime',
      header: 'Prep Time',
      render: (value: any) => <span>{value ? `${value}m` : '—'}</span>,
    },
    {
      key: 'isAvailable',
      header: 'Status',
      render: (value: any) => (
        <span className={cn(
          'px-2 py-1 rounded text-xs font-medium',
          value
            ? 'bg-[#37EFD1]/20 text-[#37EFD1]'
            : 'bg-white/10 text-white/60'
        )}>
          {value ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: MenuItem & { id: string }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onEdit(row);
              onEditClick();
            }}
            className="p-1.5 text-white/50 hover:text-[#37EFD1] rounded hover:bg-white/5 transition-colors"
            title="Edit item"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(row)}
            disabled={isDeleting}
            className="p-1.5 text-white/50 hover:text-[#C8102E] rounded hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Delete item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return <DataTable data={items} columns={columns} loading={loading} />;
}
