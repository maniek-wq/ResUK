# Porównanie scrollowania navbar - Mobile vs Desktop

## OBECNA IMPLEMENTACJA

### Navbar Component (`navbar.component.ts`)
```html
<nav 
  class="restauracja-navbar w-full bg-stone-900/95 backdrop-blur-md shadow-lg py-4 md:py-3 relative md:fixed md:top-0 md:left-0 md:right-0 md:z-50"
  [attr.data-mobile]="isMobile() ? 'true' : 'false'"
>
```

### Tailwind Classes Breakdown:

#### MOBILE (< 768px):
- `relative` - navbar jest w normalnym flow dokumentu
- `w-full` - pełna szerokość
- `py-4` - padding vertical
- **BRAK** `fixed`, `top-0`, `left-0`, `right-0`, `z-50`

#### DESKTOP (>= 768px):
- `md:fixed` - navbar jest fixed na górze
- `md:top-0 md:left-0 md:right-0` - pozycjonowanie fixed
- `md:z-50` - wysoki z-index
- `md:py-3` - mniejszy padding

---

## STRUKTURA DOM

### Home Component (`home.component.ts`):
```html
<app-navbar></app-navbar>

<!-- Hero Section -->
<section class="relative h-screen flex items-center justify-center overflow-hidden">
  ...
</section>
```

### App Component (`app.component.html`):
```html
<router-outlet />
```

### Pełna struktura:
```
html
└── body
    └── app-root
        └── router-outlet
            └── app-home
                ├── app-navbar (:host { display: block; position: static; })
                │   └── nav (relative na mobile, fixed na desktop)
                └── section (Hero)
```

---

## PROBLEM: Navbar nie scrolluje się na mobile

### Co powinno się dziać:
1. **MOBILE**: Navbar ma `position: relative` → powinien scrollować się razem ze stroną
2. **DESKTOP**: Navbar ma `position: fixed` → zostaje na górze podczas scrollowania

### Co się dzieje:
- Console pokazuje: `position: relative` ✓
- Console pokazuje: `navbarMoved: true` ✓
- **ALE**: Navbar wizualnie się nie przesuwa ✗

---

## MOŻLIWE PRZYCZYNY

### 1. **Parent Container blokuje scroll**
```scss
// Sprawdź czy któryś rodzic ma:
- position: fixed
- overflow: hidden
- height: 100vh (bez overflow-y: auto)
```

### 2. **Transform na parent**
```scss
// Transform tworzy nowy stacking context
// Może blokować scrollowanie
```

### 3. **Z-index stacking context**
```scss
// Navbar może być w innym stacking context
// niż reszta strony
```

### 4. **CSS Specificity**
```scss
// Może być jakiś inny CSS który nadpisuje
// Tailwind classes
```

---

## PORÓWNANIE: Desktop vs Mobile

### DESKTOP (DZIAŁA):
```css
nav {
  position: fixed;  /* Navbar zostaje na górze */
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

/* Strona scrolluje się normalnie */
body {
  overflow-y: auto;
}

/* Content zaczyna się pod navbar */
section {
  margin-top: 0;  /* Navbar nie zajmuje miejsca w flow */
}
```

### MOBILE (NIE DZIAŁA):
```css
nav {
  position: relative;  /* Navbar powinien scrollować się */
  /* BRAK top, left, right, z-index */
}

/* Strona powinna scrollować się normalnie */
body {
  overflow-y: auto;
}

/* Content powinien zaczynać się po navbar */
section {
  margin-top: 0;  /* Navbar zajmuje miejsce w flow */
}
```

---

## DEBUGGING CHECKLIST

### Sprawdź w DevTools:

1. **Navbar element:**
   ```javascript
   const nav = document.querySelector('app-navbar nav:not(.offcanvas-container nav)');
   console.log('Position:', window.getComputedStyle(nav).position);
   console.log('Top:', window.getComputedStyle(nav).top);
   console.log('Transform:', window.getComputedStyle(nav).transform);
   ```

2. **Parent elements:**
   ```javascript
   let parent = nav.parentElement;
   while (parent) {
     const style = window.getComputedStyle(parent);
     console.log(parent.tagName, {
       position: style.position,
       overflow: style.overflow,
       overflowY: style.overflowY,
       height: style.height,
       transform: style.transform
     });
     parent = parent.parentElement;
   }
   ```

3. **Body/HTML:**
   ```javascript
   console.log('Body overflow:', window.getComputedStyle(document.body).overflowY);
   console.log('HTML overflow:', window.getComputedStyle(document.documentElement).overflowY);
   console.log('Can scroll:', document.documentElement.scrollHeight > window.innerHeight);
   ```

4. **Scroll test:**
   ```javascript
   const initialTop = nav.getBoundingClientRect().top;
   window.scrollTo(0, 100);
   setTimeout(() => {
     const newTop = nav.getBoundingClientRect().top;
     console.log('Navbar moved:', initialTop !== newTop);
   }, 100);
   ```

---

## ROZWIĄZANIA DO PRZETESTOWANIA

### Rozwiązanie 1: Wymuś `position: relative` przez CSS
```scss
@media (max-width: 767px) {
  app-navbar nav {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
  }
}
```

### Rozwiązanie 2: Sprawdź czy parent nie blokuje
```scss
@media (max-width: 767px) {
  app-navbar {
    position: static !important;
  }
  
  app-home {
    position: relative !important;
    overflow: visible !important;
  }
}
```

### Rozwiązanie 3: Użyj `sticky` zamiast `relative`
```html
<!-- Może sticky będzie działać lepiej? -->
<nav class="... sticky top-0 md:fixed md:top-0 ...">
```

### Rozwiązanie 4: Sprawdź czy nie ma `transform` na parent
```scss
/* Transform tworzy nowy stacking context */
/* Może blokować scrollowanie */
app-navbar {
  transform: none !important;
}
```

---

## NASTĘPNE KROKI

1. Sprawdź w DevTools wszystkie parent elements navbar
2. Sprawdź czy nie ma `transform` na parent
3. Sprawdź czy nie ma `overflow: hidden` na parent
4. Sprawdź czy `body` i `html` mogą scrollować się
5. Przetestuj rozwiązanie z `!important` w CSS
