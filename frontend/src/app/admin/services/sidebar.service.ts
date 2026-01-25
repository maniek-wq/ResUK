import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
    if (typeof document !== 'undefined') {
      // Ustaw overflow hidden tylko na mobile (gdy szerokość < 768px)
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
        // Upewnij się, że html też nie ma overflow
        document.documentElement.style.overflow = 'hidden';
      }
    }
  }

  close(): void {
    this.isOpen.set(false);
    if (typeof document !== 'undefined') {
      // Przywróć overflow tylko na mobile
      if (window.innerWidth < 768) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    }
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
}
