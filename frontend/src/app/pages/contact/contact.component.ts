import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <!-- Hero -->
    <section class="relative h-[40vh] min-h-[350px] flex items-center justify-center">
      <div class="absolute inset-0 bg-stone-900">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] 
                    bg-cover bg-center opacity-40"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/60"></div>
      </div>
      
      <div class="relative z-10 text-center px-6">
        <span class="font-accent text-brown-400 text-lg tracking-wider mb-4 block">Skontaktuj się</span>
        <h1 class="font-display text-5xl md:text-6xl text-warm-100 font-bold">
          Kontakt
        </h1>
        <div class="w-24 h-0.5 bg-gradient-to-r from-transparent via-brown-500 to-transparent mx-auto mt-6"></div>
      </div>
    </section>

    <!-- Contact Content -->
    <section class="py-20 bg-warm-50">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <!-- Contact Info -->
          <div>
            <h2 class="font-display text-3xl text-stone-800 font-semibold mb-8">
              Nasze Lokale
            </h2>

            <!-- Location 1 -->
            <div class="mb-10 p-8 bg-white rounded-sm shadow-md">
              <h3 class="font-display text-xl text-brown-700 font-semibold mb-4">
                Centrum
              </h3>
              <div class="space-y-3 text-stone-600">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-brown-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <div>
                    <p>ul. Złota 15</p>
                    <p>00-019 Warszawa</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-brown-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <a href="tel:+48221234567" class="hover:text-brown-700 transition-colors">
                    +48 22 123 45 67
                  </a>
                </div>
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-brown-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <a href="mailto:centrum@restauracjazlota.pl" class="hover:text-brown-700 transition-colors">
                    centrum&#64;restauracjazlota.pl
                  </a>
                </div>
              </div>
              <div class="mt-6 pt-6 border-t border-warm-200">
                <p class="text-sm text-stone-500 font-semibold mb-2">Godziny otwarcia:</p>
                <p class="text-sm text-stone-600">Pon-Śr: 12:00 - 22:00</p>
                <p class="text-sm text-stone-600">Czw: 12:00 - 23:00</p>
                <p class="text-sm text-stone-600">Pt-Sob: 11:00 - 24:00</p>
                <p class="text-sm text-stone-600">Niedziela: 11:00 - 21:00</p>
              </div>
            </div>

            <!-- Location 2 -->
            <div class="p-8 bg-white rounded-sm shadow-md">
              <h3 class="font-display text-xl text-brown-700 font-semibold mb-4">
                Mokotów
              </h3>
              <div class="space-y-3 text-stone-600">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-brown-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <div>
                    <p>ul. Puławska 152</p>
                    <p>02-624 Warszawa</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-brown-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <a href="tel:+48229876543" class="hover:text-brown-700 transition-colors">
                    +48 22 987 65 43
                  </a>
                </div>
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-brown-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <a href="mailto:mokotow@restauracjazlota.pl" class="hover:text-brown-700 transition-colors">
                    mokotow&#64;restauracjazlota.pl
                  </a>
                </div>
              </div>
              <div class="mt-6 pt-6 border-t border-warm-200">
                <p class="text-sm text-stone-500 font-semibold mb-2">Godziny otwarcia:</p>
                <p class="text-sm text-stone-600">Pon-Czw: 12:00 - 22:00</p>
                <p class="text-sm text-stone-600">Pt-Sob: 11:00 - 23:00</p>
                <p class="text-sm text-stone-600">Niedziela: 11:00 - 21:00</p>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div>
            <h2 class="font-display text-3xl text-stone-800 font-semibold mb-8">
              Napisz do nas
            </h2>
            
            <form (ngSubmit)="onSubmit()" class="space-y-6 bg-white p-8 rounded-sm shadow-md">
              <div>
                <label class="block text-stone-700 text-sm font-semibold mb-2">Imię i nazwisko</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.name"
                  name="name"
                  class="form-input"
                  placeholder="Jan Kowalski"
                  required
                >
              </div>

              <div>
                <label class="block text-stone-700 text-sm font-semibold mb-2">Email</label>
                <input 
                  type="email" 
                  [(ngModel)]="formData.email"
                  name="email"
                  class="form-input"
                  placeholder="jan@example.com"
                  required
                >
              </div>

              <div>
                <label class="block text-stone-700 text-sm font-semibold mb-2">Telefon</label>
                <input 
                  type="tel" 
                  [(ngModel)]="formData.phone"
                  name="phone"
                  class="form-input"
                  placeholder="+48 123 456 789"
                >
              </div>

              <div>
                <label class="block text-stone-700 text-sm font-semibold mb-2">Temat</label>
                <select 
                  [(ngModel)]="formData.subject"
                  name="subject"
                  class="form-input"
                >
                  <option value="">Wybierz temat</option>
                  <option value="rezerwacja">Pytanie o rezerwację</option>
                  <option value="wydarzenie">Organizacja wydarzenia</option>
                  <option value="menu">Pytanie o menu</option>
                  <option value="wspolpraca">Współpraca</option>
                  <option value="inne">Inne</option>
                </select>
              </div>

              <div>
                <label class="block text-stone-700 text-sm font-semibold mb-2">Wiadomość</label>
                <textarea 
                  [(ngModel)]="formData.message"
                  name="message"
                  rows="5"
                  class="form-input resize-none"
                  placeholder="Twoja wiadomość..."
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                class="btn-primary w-full"
                [disabled]="isSubmitting()"
              >
                <span *ngIf="!isSubmitting()">Wyślij wiadomość</span>
                <span *ngIf="isSubmitting()">Wysyłanie...</span>
              </button>

              <p *ngIf="submitMessage()" 
                 class="text-center text-sm"
                 [class.text-green-600]="submitSuccess()"
                 [class.text-red-600]="!submitSuccess()">
                {{ submitMessage() }}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section -->
    <section class="h-[400px] bg-warm-200">
      <div class="h-full w-full bg-stone-300 flex items-center justify-center">
        <p class="text-stone-500">
          Tutaj można dodać mapę Google Maps z lokalizacjami
        </p>
      </div>
    </section>

    <app-footer></app-footer>
  `
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting = signal(false);
  submitMessage = signal('');
  submitSuccess = signal(false);

  onSubmit(): void {
    this.isSubmitting.set(true);
    
    // Simulate form submission
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);
      this.submitMessage.set('Dziękujemy! Twoja wiadomość została wysłana. Odpowiemy najszybciej jak to możliwe.');
      
      // Reset form
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      };

      // Clear message after 5 seconds
      setTimeout(() => {
        this.submitMessage.set('');
      }, 5000);
    }, 1500);
  }
}
