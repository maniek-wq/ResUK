# Plan Implementacji Zarządzania Menu

## 📋 Cel
Utworzenie kompletnego systemu zarządzania menu dla adminów i managerów, umożliwiającego dynamiczną edycję karty dań bez konieczności modyfikacji kodu.

---

## 🗂️ Struktura Danych

### Model: MenuCategory (Kategoria Menu)
```javascript
{
  _id: ObjectId,
  name: String,           // np. "Przystawki", "Dania główne"
  description: String,    // Opis kategorii
  order: Number,          // Kolejność wyświetlania
  isActive: Boolean,      // Widoczna dla klientów
  imageUrl: String,       // Opcjonalne zdjęcie kategorii
  createdAt: Date,
  updatedAt: Date
}
```

### Model: MenuItem (Pozycja Menu)
```javascript
{
  _id: ObjectId,
  category: ObjectId,     // Referencja do MenuCategory
  name: String,           // Nazwa dania
  description: String,    // Opis dania
  price: Number,          // Cena (w groszach lub jako decimal)
  currency: String,       // "PLN" (domyślnie)
  tags: [String],         // ["vege", "ostre", "szef poleca", "gluten-free"]
  allergens: [String],    // ["gluten", "laktoza", "orzechy"]
  imageUrl: String,       // URL zdjęcia dania
  isAvailable: Boolean,   // Dostępność (można wyłączyć bez usuwania)
  order: Number,          // Kolejność w kategorii
  prepTime: Number,       // Czas przygotowania w minutach (opcjonalnie)
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId     // Referencja do Admin
}
```

---

## 🔧 Backend Implementation

### Krok 1: Modele MongoDB

**Plik: `backend/src/models/MenuCategory.js`**
- Schema dla kategorii menu
- Index na `order` i `isActive`
- Virtual dla liczby pozycji w kategorii

**Plik: `backend/src/models/MenuItem.js`**
- Schema dla pozycji menu
- Index na `category`, `isAvailable`, `order`
- Populate kategorii przy pobieraniu

### Krok 2: API Endpoints

#### MenuCategories (Kategorie)

| Metoda | Endpoint | Uprawnienia | Opis |
|--------|----------|-------------|------|
| GET | `/api/menu/categories` | Publiczne | Lista aktywnych kategorii |
| GET | `/api/menu/categories/:id` | Publiczne | Szczegóły kategorii |
| GET | `/api/menu/categories/all` | Admin/Manager | Wszystkie kategorie (w tym nieaktywne) |
| POST | `/api/menu/categories` | Admin/Manager | Utworzenie kategorii |
| PUT | `/api/menu/categories/:id` | Admin/Manager | Aktualizacja kategorii |
| DELETE | `/api/menu/categories/:id` | Admin | Usunięcie kategorii (soft delete) |
| PATCH | `/api/menu/categories/:id/reorder` | Admin/Manager | Zmiana kolejności |

#### MenuItems (Pozycje Menu)

| Metoda | Endpoint | Uprawnienia | Opis |
|--------|----------|-------------|------|
| GET | `/api/menu/items` | Publiczne | Lista aktywnych pozycji (z filtrem kategorii) |
| GET | `/api/menu/items/:id` | Publiczne | Szczegóły pozycji |
| GET | `/api/menu/items/category/:categoryId` | Publiczne | Pozycje w danej kategorii |
| GET | `/api/menu/items/all` | Admin/Manager | Wszystkie pozycje |
| POST | `/api/menu/items` | Admin/Manager | Utworzenie pozycji |
| PUT | `/api/menu/items/:id` | Admin/Manager | Aktualizacja pozycji |
| DELETE | `/api/menu/items/:id` | Admin/Manager | Usunięcie pozycji |
| PATCH | `/api/menu/items/:id/toggle-availability` | Admin/Manager | Zmiana dostępności |
| PATCH | `/api/menu/items/:id/reorder` | Admin/Manager | Zmiana kolejności |

### Krok 3: Controllers

**Plik: `backend/src/controllers/menuCategoryController.js`**
- `getCategories` - publiczne, tylko aktywne
- `getAllCategories` - dla admina, wszystkie
- `getCategory` - szczegóły pojedynczej kategorii
- `createCategory` - walidacja, domyślny order
- `updateCategory` - częściowa aktualizacja
- `deleteCategory` - soft delete + deaktywacja pozycji
- `reorderCategories` - zmiana kolejności wielu kategorii

**Plik: `backend/src/controllers/menuItemController.js`**
- `getItems` - publiczne, z filtrowaniem
- `getAllItems` - dla admina
- `getItemsByCategory` - pozycje w kategorii
- `getItem` - szczegóły pozycji
- `createItem` - walidacja, ustawienie order
- `updateItem` - częściowa aktualizacja
- `deleteItem` - usunięcie
- `toggleAvailability` - szybka zmiana dostępności
- `reorderItems` - zmiana kolejności w kategorii
- `duplicateItem` - duplikowanie pozycji (szybkie dodanie podobnego)

### Krok 4: Walidacja

**Walidacja kategorii:**
- `name` - wymagane, min 2, max 50 znaków
- `description` - max 200 znaków
- `order` - liczba całkowita, >= 0

**Walidacja pozycji menu:**
- `category` - wymagane, musi istnieć
- `name` - wymagane, min 2, max 100 znaków
- `description` - max 500 znaków
- `price` - wymagane, > 0, max 9999.99
- `tags` - tablica, tylko dozwolone wartości
- `allergens` - tablica, opcjonalna

### Krok 5: Routes

**Plik: `backend/src/routes/menu.js`**
```javascript
// Publiczne
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.get('/items', getItems);
router.get('/items/:id', getItem);
router.get('/items/category/:categoryId', getItemsByCategory);

// Admin/Manager
router.get('/categories/all', protect, authorize('admin', 'manager'), getAllCategories);
router.post('/categories', protect, authorize('admin', 'manager'), validateCategory, createCategory);
router.put('/categories/:id', protect, authorize('admin', 'manager'), validateCategory, updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);
router.patch('/categories/:id/reorder', protect, authorize('admin', 'manager'), reorderCategories);

router.get('/items/all', protect, authorize('admin', 'manager'), getAllItems);
router.post('/items', protect, authorize('admin', 'manager'), validateMenuItem, createItem);
router.put('/items/:id', protect, authorize('admin', 'manager'), validateMenuItem, updateItem);
router.delete('/items/:id', protect, authorize('admin', 'manager'), deleteItem);
router.patch('/items/:id/toggle-availability', protect, authorize('admin', 'manager'), toggleAvailability);
router.patch('/items/:id/reorder', protect, authorize('admin', 'manager'), reorderItems);
router.post('/items/:id/duplicate', protect, authorize('admin', 'manager'), duplicateItem);
```

---

## 🎨 Frontend Implementation

### Krok 1: Serwisy

**Plik: `frontend/src/app/core/services/menu.service.ts`**
```typescript
- getCategories(includeInactive?: boolean): Observable
- getCategory(id: string): Observable
- createCategory(data): Observable
- updateCategory(id, data): Observable
- deleteCategory(id): Observable
- reorderCategories(ids: string[]): Observable

- getItems(categoryId?: string, includeUnavailable?: boolean): Observable
- getItem(id: string): Observable
- createItem(data): Observable
- updateItem(id, data): Observable
- deleteItem(id): Observable
- toggleItemAvailability(id): Observable
- reorderItems(categoryId, itemIds: string[]): Observable
- duplicateItem(id): Observable
```

### Krok 2: Komponenty Panelu Admina

#### 2.1. Strona główna zarządzania menu
**Plik: `frontend/src/app/admin/pages/menu/menu-management.component.ts`**
- Widok przeglądu kategorii i pozycji
- Drag & drop do zmiany kolejności
- Quick actions (edytuj, usuń, duplikuj)
- Filtry i wyszukiwarka

#### 2.2. Zarządzanie kategoriami
**Plik: `frontend/src/app/admin/pages/menu/categories/categories.component.ts`**
- Lista kategorii z możliwością sortowania
- Formularz dodawania/edycji kategorii
- Upload zdjęcia kategorii
- Aktywacja/deaktywacja kategorii
- Usuwanie kategorii (z ostrzeżeniem o pozycjach)

#### 2.3. Zarządzanie pozycjami menu
**Plik: `frontend/src/app/admin/pages/menu/items/items.component.ts`**
- Lista pozycji z filtrowaniem po kategorii
- Formularz dodawania/edycji pozycji:
  - Wybór kategorii
  - Nazwa, opis
  - Cena (input z formatowaniem)
  - Tagi (checkboxy: vege, ostre, szef poleca, gluten-free)
  - Alergeny (multi-select)
  - Upload zdjęcia
  - Czas przygotowania
- Quick toggle dostępności
- Duplikowanie pozycji
- Sortowanie (drag & drop)

#### 2.4. Edytor pozycji menu
**Plik: `frontend/src/app/admin/pages/menu/items/item-editor.component.ts`**
- Pełny formularz edycji
- Podgląd na żywo
- Upload i zarządzanie zdjęciami
- Historia zmian (jeśli zaimplementowana)

### Krok 3: Aktualizacja widoku klienta

**Plik: `frontend/src/app/pages/menu/menu.component.ts`**
- Usunięcie hardcoded danych
- Pobieranie danych z API przez `MenuService`
- Loading states
- Error handling
- Cache danych (opcjonalnie)

### Krok 4: Routing Admina

Dodanie do `frontend/src/app/app.routes.ts`:
```typescript
{
  path: 'admin/menu',
  children: [
    { path: '', component: MenuManagementComponent },
    { path: 'categories', component: CategoriesComponent },
    { path: 'categories/:id/edit', component: CategoryEditorComponent },
    { path: 'items', component: ItemsComponent },
    { path: 'items/new', component: ItemEditorComponent },
    { path: 'items/:id/edit', component: ItemEditorComponent }
  ],
  canActivate: [authGuard]
}
```

---

## 📝 Funkcjonalności Szczegółowe

### 1. Zarządzanie Kategoriami

#### Dodawanie kategorii:
- Formularz z polami: nazwa, opis, kolejność
- Upload zdjęcia (opcjonalnie)
- Podgląd przed zapisem
- Walidacja w czasie rzeczywistym

#### Edycja kategorii:
- Wszystkie pola edytowalne
- Możliwość zmiany kolejności
- Aktywacja/deaktywacja (ukrycie przed klientami)
- Historia zmian

#### Usuwanie kategorii:
- Ostrzeżenie jeśli kategoria zawiera pozycje
- Opcje:
  - Przenieś pozycje do innej kategorii
  - Deaktywuj pozycje
  - Usuń wszystkie pozycje (tylko admin)

### 2. Zarządzanie Pozycjami Menu

#### Dodawanie pozycji:
- Wybór kategorii (dropdown)
- Nazwa, opis (textarea z licznikiem znaków)
- Cena (input z formatowaniem waluty)
- Tagi:
  - Checkboxy: Vege, Ostre, Szef poleca, Bez glutenu
  - Custom tagi (opcjonalnie)
- Alergeny:
  - Multi-select: Gluten, Laktoza, Orzechy, Jaja, Ryby, Skorupiaki
- Upload zdjęcia:
  - Drag & drop
  - Podgląd
  - Kompresja (opcjonalnie)
- Czas przygotowania (opcjonalnie)
- Kolejność (auto lub manual)

#### Edycja pozycji:
- Wszystkie pola edytowalne
- Quick actions:
  - Toggle dostępności (przycisk ON/OFF)
  - Duplikuj pozycję
  - Zmień kategorię
- Podgląd w widoku klienta

#### Zarządzanie dostępnością:
- Quick toggle na liście
- Bulk actions (masowe zmiany)
- Ustawienie jako "czasowo niedostępne"

### 3. Sortowanie (Drag & Drop)

#### Kategorie:
- Zmiana kolejności kategorii
- Wizualny feedback podczas przeciągania
- Auto-save lub przycisk "Zapisz kolejność"

#### Pozycje w kategorii:
- Sortowanie pozycji w ramach kategorii
- Podgląd zmiany kolejności
- Wykorzystanie biblioteki: `@angular/cdk/drag-drop`

### 4. Upload Zdjęć

#### Wymagania:
- Format: JPG, PNG, WebP
- Maksymalny rozmiar: 2MB
- Rekomendowany rozmiar: 800x600px
- Kompresja po stronie klienta lub serwera

#### Implementacja:
- Backend: endpoint `/api/upload/menu-image`
- Przechowywanie: lokalne lub cloud storage (AWS S3, Cloudinary)
- URL w bazie danych

---

## 🎯 Przebieg Implementacji (Timeline)

### Faza 1: Backend (2-3 dni)
1. ✅ Modele MongoDB (MenuCategory, MenuItem)
2. ✅ Controllers z podstawowymi operacjami CRUD
3. ✅ Routes i middleware walidacji
4. ✅ Testy endpointów (Postman/Thunder Client)

### Faza 2: Frontend - Serwisy i Podstawowe Komponenty (2 dni)
1. ✅ MenuService z integracją API
2. ✅ Komponent zarządzania kategoriami
3. ✅ Komponent zarządzania pozycjami
4. ✅ Aktualizacja widoku klienta (pobieranie z API)

### Faza 3: Zaawansowane Funkcjonalności (2-3 dni)
1. ✅ Drag & drop sortowanie
2. ✅ Upload zdjęć
3. ✅ Bulk operations
4. ✅ Filtry i wyszukiwarka
5. ✅ Quick actions (toggle, duplicate)

### Faza 4: Polishing (1-2 dni)
1. ✅ Walidacja formularzy
2. ✅ Loading states
3. ✅ Error handling
4. ✅ Responsywność
5. ✅ UX improvements

---

## 🔒 Bezpieczeństwo i Autoryzacja

### Uprawnienia:
- **Admin**: Wszystkie operacje (w tym usuwanie)
- **Manager**: CRUD kategorii i pozycji (bez usuwania kategorii)
- **Staff**: Tylko odczyt

### Walidacja:
- Wszystkie inputy po stronie serwera
- Sanityzacja HTML w opisach
- Limit rozmiaru zdjęć
- Rate limiting na endpointach

---

## 📊 Dodatkowe Funkcjonalności (Future Enhancements)

### Wersja 2.0:
1. **Historia zmian** - logowanie edycji menu
2. **Wersjonowanie** - zapisywanie wersji menu (np. menu sezonowe)
3. **Import/Export** - CSV/JSON import/export menu
4. **Multi-language** - wsparcie wielu języków
5. **Zdjęcia dla kategorii** - galerie zdjęć
6. **Statystyki** - najpopularniejsze pozycje
7. **Menu dla lokali** - różne menu dla różnych lokali
8. **Sezonowość** - automatyczne pokazywanie/ukrywanie pozycji według daty

---

## 🧪 Testowanie

### Backend:
- Unit testy dla controllers
- Testy integracyjne API
- Testy walidacji

### Frontend:
- Unit testy dla serwisów
- Testy komponentów
- E2E testy dla flow dodawania pozycji

---

## 📱 UX/UI Design Notes

### Kolory i Styl:
- Utrzymanie palety: szarość, beż, brąz
- Spójność z obecnym designem panelu admina
- Intuicyjne ikony (edit, delete, duplicate, reorder)

### Responsywność:
- Desktop-first dla panelu admina
- Mobile-friendly dla podstawowych operacji
- Tablet-optimized

### Animacje:
- Smooth transitions przy drag & drop
- Loading spinners
- Success/error toasts

---

## 📦 Zależności (Dodatkowe)

### Backend:
- `multer` lub `express-fileupload` - upload zdjęć
- `sharp` - przetwarzanie obrazów (opcjonalnie)

### Frontend:
- `@angular/cdk/drag-drop` - drag & drop
- `ngx-image-cropper` - cropowanie zdjęć (opcjonalnie)

---

## ✅ Checklist Implementacji

### Backend:
- [ ] Model MenuCategory
- [ ] Model MenuItem
- [ ] Controller menuCategoryController
- [ ] Controller menuItemController
- [ ] Routes `/api/menu/*`
- [ ] Walidacja danych
- [ ] Middleware autoryzacji
- [ ] Endpoint upload zdjęć
- [ ] Seed danych (opcjonalnie)

### Frontend:
- [ ] MenuService
- [ ] Komponent menu-management
- [ ] Komponent categories
- [ ] Komponent items
- [ ] Komponent item-editor
- [ ] Aktualizacja menu.component (klient)
- [ ] Routing admina
- [ ] Drag & drop sortowanie
- [ ] Upload zdjęć
- [ ] Loading states
- [ ] Error handling

---

## 🚀 Quick Start (Po implementacji)

1. **Seed menu** (opcjonalnie):
   ```bash
   npm run seed:menu
   ```

2. **Dostęp do panelu**:
   - Zaloguj się jako admin/manager
   - Przejdź do `/admin/menu`
   - Rozpocznij zarządzanie menu

---

**Ostatnia aktualizacja**: 2025-01-19
**Wersja planu**: 1.0
