import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface MenuCategory {
  _id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  imageUrl?: string;
  itemCount?: number;
  activeItemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  _id: string;
  category: string | MenuCategory;
  name: string;
  description?: string;
  price: number;
  currency: string;
  tags?: string[];
  allergens?: string[];
  imageUrl?: string;
  isAvailable: boolean;
  order: number;
  prepTime?: number;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface CreateMenuItemDto {
  category: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  tags?: string[];
  allergens?: string[];
  imageUrl?: string;
  isAvailable?: boolean;
  order?: number;
  prepTime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  categories = signal<MenuCategory[]>([]);
  items = signal<MenuItem[]>([]);
  loading = signal(false);

  constructor(private api: ApiService) {}

  // ========== Kategorie (Publiczne) ==========
  
  getCategories(includeInactive: boolean = false): Observable<{ success: boolean; count: number; data: MenuCategory[] }> {
    const endpoint = includeInactive ? '/menu/categories/all' : '/menu/categories';
    
    if (includeInactive) {
      this.loading.set(true);
      return this.api.get<{ success: boolean; count: number; data: MenuCategory[] }>(endpoint).pipe(
        tap(response => {
          if (response.success) {
            this.categories.set(response.data);
          }
          this.loading.set(false);
        })
      );
    }
    
    return this.api.get<{ success: boolean; count: number; data: MenuCategory[] }>(endpoint).pipe(
      tap(response => {
        if (response.success) {
          this.categories.set(response.data);
        }
      })
    );
  }

  getCategory(id: string): Observable<{ success: boolean; data: MenuCategory }> {
    return this.api.get<{ success: boolean; data: MenuCategory }>(`/menu/categories/${id}`);
  }

  // ========== Kategorie (Admin/Manager) ==========
  
  createCategory(data: CreateCategoryDto): Observable<{ success: boolean; data: MenuCategory }> {
    return this.api.post<{ success: boolean; data: MenuCategory }>('/menu/categories', data);
  }

  updateCategory(id: string, data: Partial<CreateCategoryDto>): Observable<{ success: boolean; data: MenuCategory }> {
    return this.api.put<{ success: boolean; data: MenuCategory }>(`/menu/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/menu/categories/${id}`);
  }

  reorderCategories(categoryIds: string[]): Observable<{ success: boolean; message: string }> {
    return this.api.patch<{ success: boolean; message: string }>('/menu/categories/reorder', { categoryIds });
  }

  toggleCategory(id: string): Observable<{ success: boolean; data: MenuCategory }> {
    return this.api.patch<{ success: boolean; data: MenuCategory }>(`/menu/categories/${id}/toggle`, {});
  }

  // ========== Pozycje Menu (Publiczne) ==========
  
  getItems(categoryId?: string, includeUnavailable: boolean = false): Observable<{ success: boolean; count: number; data: MenuItem[] }> {
    const endpoint = includeUnavailable ? '/menu/items/all' : '/menu/items';
    const params: any = {};
    
    if (categoryId) {
      params.category = categoryId;
    }
    
    return this.api.get<{ success: boolean; count: number; data: MenuItem[] }>(endpoint, params).pipe(
      tap(response => {
        if (response.success) {
          this.items.set(response.data);
        }
      })
    );
  }

  getItemsByCategory(categoryId: string): Observable<{ success: boolean; count: number; data: MenuItem[] }> {
    return this.api.get<{ success: boolean; count: number; data: MenuItem[] }>(`/menu/items/category/${categoryId}`);
  }

  getItem(id: string): Observable<{ success: boolean; data: MenuItem }> {
    return this.api.get<{ success: boolean; data: MenuItem }>(`/menu/items/${id}`);
  }

  // ========== Pozycje Menu (Admin/Manager) ==========
  
  createItem(data: CreateMenuItemDto): Observable<{ success: boolean; data: MenuItem }> {
    return this.api.post<{ success: boolean; data: MenuItem }>('/menu/items', data);
  }

  updateItem(id: string, data: Partial<CreateMenuItemDto>): Observable<{ success: boolean; data: MenuItem }> {
    return this.api.put<{ success: boolean; data: MenuItem }>(`/menu/items/${id}`, data);
  }

  deleteItem(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/menu/items/${id}`);
  }

  toggleItemAvailability(id: string): Observable<{ success: boolean; data: MenuItem }> {
    return this.api.patch<{ success: boolean; data: MenuItem }>(`/menu/items/${id}/toggle-availability`, {});
  }

  reorderItems(categoryId: string, itemIds: string[]): Observable<{ success: boolean; message: string }> {
    return this.api.patch<{ success: boolean; message: string }>('/menu/items/reorder', {
      categoryId,
      itemIds
    });
  }

  duplicateItem(id: string): Observable<{ success: boolean; data: MenuItem; message: string }> {
    return this.api.post<{ success: boolean; data: MenuItem; message: string }>(`/menu/items/${id}/duplicate`, {});
  }

  // Helper - formatuj cenę
  formatPrice(price: number, currency: string = 'PLN'): string {
    return `${price.toFixed(2)} ${currency}`;
  }

  // Helper - pobierz pozycje w kategorii
  getItemsForCategory(categoryId: string): MenuItem[] {
    return this.items().filter(item => {
      const itemCategoryId = typeof item.category === 'string' ? item.category : item.category._id;
      return itemCategoryId === categoryId;
    }).sort((a, b) => a.order - b.order);
  }

  // Helper - pobierz aktywne kategorie z pozycjami
  getCategoriesWithItems(): Array<MenuCategory & { items: MenuItem[] }> {
    return this.categories()
      .filter(cat => cat.isActive)
      .sort((a, b) => a.order - b.order)
      .map(category => ({
        ...category,
        items: this.getItemsForCategory(category._id).filter(item => item.isAvailable)
      }));
  }
}
