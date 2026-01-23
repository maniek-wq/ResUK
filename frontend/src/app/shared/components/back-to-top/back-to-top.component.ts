import { Component, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="scrollToTop()"
      class="back-to-top-button fixed bottom-8 right-8 z-40 w-12 h-12 md:w-14 md:h-14 
             bg-brown-700 hover:bg-brown-600 active:bg-brown-800
             text-white rounded-full shadow-lg hover:shadow-xl
             flex items-center justify-center
             transition-all duration-300 ease-out
             transform hover:scale-110 active:scale-95"
      [class.visible]="showButton()"
      [attr.aria-hidden]="!showButton()"
      aria-label="Powrót do góry"
      title="Powrót do góry"
    >
      <svg 
        class="w-6 h-6 md:w-7 md:h-7" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        stroke-width="2"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  `,
  styles: [`
    .back-to-top-button {
      opacity: 0;
      transform: translateY(1rem);
      pointer-events: none;
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    }
    
    .back-to-top-button.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  `]
})
export class BackToTopComponent implements OnInit {
  showButton = signal(false);
  private scrollThreshold = 300; // Pokaż przycisk po scrollu > 300px

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.checkScrollPosition();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  private checkScrollPosition(): void {
    if (typeof window !== 'undefined') {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      this.showButton.set(scrollY > this.scrollThreshold);
    }
  }

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
