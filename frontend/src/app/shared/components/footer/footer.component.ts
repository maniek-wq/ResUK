import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-stone-900 text-warm-200">
      <!-- Main Footer -->
      <div class="container mx-auto px-6 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <!-- Brand -->
          <div class="lg:col-span-1">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-brown-600 to-brown-800 flex items-center justify-center">
                <span class="font-display text-white text-xl font-bold">Z</span>
              </div>
              <div>
                <span class="font-display text-2xl font-semibold text-warm-100">Restauracja</span>
                <span class="font-accent text-brown-400 text-xl ml-1 italic">Złota</span>
              </div>
            </div>
            <p class="text-warm-400 text-sm leading-relaxed mb-6">
              Wykwintna kuchnia polska i europejska w dwóch eleganckich lokalizacjach w sercu Warszawy.
            </p>
            <div class="flex gap-4">
              <a href="#" class="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center 
                               hover:bg-brown-700 transition-colors duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center 
                               hover:bg-brown-700 transition-colors duration-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Locations -->
          <div class="lg:col-span-1">
            <h4 class="font-display text-lg text-warm-100 mb-6">Nasze Lokale</h4>
            <div class="space-y-6">
              <div>
                <p class="font-semibold text-warm-100 mb-1">Centrum</p>
                <p class="text-warm-400 text-sm">ul. Złota 15</p>
                <p class="text-warm-400 text-sm">00-019 Warszawa</p>
                <p class="text-brown-400 text-sm mt-1">+48 22 123 45 67</p>
              </div>
              <div>
                <p class="font-semibold text-warm-100 mb-1">Mokotów</p>
                <p class="text-warm-400 text-sm">ul. Puławska 152</p>
                <p class="text-warm-400 text-sm">02-624 Warszawa</p>
                <p class="text-brown-400 text-sm mt-1">+48 22 987 65 43</p>
              </div>
            </div>
          </div>

          <!-- Opening Hours -->
          <div class="lg:col-span-1">
            <h4 class="font-display text-lg text-warm-100 mb-6">Godziny Otwarcia</h4>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-warm-400">Pon - Śr</span>
                <span class="text-warm-200">12:00 - 22:00</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-warm-400">Czw</span>
                <span class="text-warm-200">12:00 - 23:00</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-warm-400">Pt - Sob</span>
                <span class="text-warm-200">11:00 - 24:00</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-warm-400">Niedziela</span>
                <span class="text-warm-200">11:00 - 21:00</span>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="lg:col-span-1">
            <h4 class="font-display text-lg text-warm-100 mb-6">Szybkie Linki</h4>
            <nav class="space-y-3">
              <a routerLink="/menu" class="block text-warm-400 text-sm hover:text-brown-400 hover:pl-2 transition-all duration-300">
                Menu
              </a>
              <a routerLink="/rezerwacja" class="block text-warm-400 text-sm hover:text-brown-400 hover:pl-2 transition-all duration-300">
                Rezerwacja
              </a>
              <a routerLink="/o-nas" class="block text-warm-400 text-sm hover:text-brown-400 hover:pl-2 transition-all duration-300">
                O nas
              </a>
              <a routerLink="/kontakt" class="block text-warm-400 text-sm hover:text-brown-400 hover:pl-2 transition-all duration-300">
                Kontakt
              </a>
              <!-- Link do panelu admina usunięty ze względów bezpieczeństwa -->
              <!-- Panel admina dostępny tylko przez bezpośredni URL: /admin/login -->
            </nav>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-stone-800">
        <div class="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-warm-500 text-sm">
            © {{ currentYear }} Restauracja Złota. Wszelkie prawa zastrzeżone.
          </p>
          <div class="flex gap-6 text-sm">
            <button 
               (click)="openPrivacyModal()"
               class="text-warm-500 hover:text-warm-300 transition-colors cursor-pointer underline bg-transparent border-0 p-0 text-sm">Polityka prywatności</button>
            <button 
               (click)="openTermsModal()"
               class="text-warm-500 hover:text-warm-300 transition-colors cursor-pointer underline bg-transparent border-0 p-0 text-sm">Regulamin</button>
          </div>
        </div>
      </div>
    </footer>

    <!-- Privacy Policy Modal -->
    <div *ngIf="showPrivacyModal()" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
         (click)="closePrivacyModal()">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
           (click)="$event.stopPropagation()">
        <div class="p-6 border-b border-warm-200 flex items-center justify-between bg-stone-50 flex-shrink-0">
          <h2 class="font-display text-2xl text-stone-800 font-semibold">Polityka Prywatności</h2>
          <button (click)="closePrivacyModal()" class="text-stone-400 hover:text-stone-600 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto flex-1 p-6 md:p-8">
          <p class="text-stone-500 text-sm mb-6">Ostatnia aktualizacja: {{ currentDate }}</p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4">1. Informacje ogólne</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych 
            przekazanych przez Użytkowników w związku z korzystaniem przez nich z usług Restauracji Złota 
            (zwana dalej „Restauracją"), dostępnych za pośrednictwem strony internetowej.
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">2. Administrator danych</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            Administratorem danych osobowych jest:<br>
            [NAZWA FIRMY]<br>
            [ADRES FIRMY]<br>
            NIP: [NUMER NIP]<br>
            REGON: [NUMER REGON]<br><br>
            Kontakt z Administratorem: kontakt&#64;restauracjazlota.pl
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">3. Zakres zbieranych danych</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            Restauracja przetwarza następujące dane osobowe:<br>
            1. Dane przekazane w formularzu rezerwacji: imię, nazwisko, numer telefonu, adres e-mail;<br>
            2. Dane przekazane telefonicznie przy rezerwacji;<br>
            3. Dane zbierane automatycznie podczas korzystania ze strony internetowej (adres IP, 
            typ przeglądarki, czas wizyty, strony odwiedzone) - więcej informacji w sekcji dotyczącej plików cookies.
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">4. Cel przetwarzania danych</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            Dane osobowe są przetwarzane w następujących celach:<br>
            1. Realizacja rezerwacji stolików i wydarzeń;<br>
            2. Kontakt z klientami w sprawie rezerwacji;<br>
            3. Wysyłka potwierdzeń rezerwacji;<br>
            4. Marketing własnych usług (za zgodą klienta);<br>
            5. Prowadzenie statystyk i analiz;<br>
            6. Wypełnienie obowiązków prawnych ciążących na Restauracji.
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">5. Prawa użytkownika</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            Każda osoba ma prawo do:<br>
            1. Dostępu do swoich danych osobowych;<br>
            2. Sprostowania danych;<br>
            3. Usunięcia danych (prawo do bycia zapomnianym);<br>
            4. Ograniczenia przetwarzania;<br>
            5. Przenoszenia danych;<br>
            6. Wniesienia sprzeciwu wobec przetwarzania;<br>
            7. Wniesienia skargi do organu nadzorczego (UODO).
          </p>

          <div class="mt-8 pt-6 border-t border-warm-200">
            <p class="text-stone-500 text-sm">
              W przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt:<br>
              Email: kontakt&#64;restauracjazlota.pl<br>
              Telefon: +48 22 123 45 67
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms Modal -->
    <div *ngIf="showTermsModal()" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
         (click)="closeTermsModal()">
      <div class="bg-white rounded-sm shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
           (click)="$event.stopPropagation()">
        <div class="p-6 border-b border-warm-200 flex items-center justify-between bg-stone-50 flex-shrink-0">
          <h2 class="font-display text-2xl text-stone-800 font-semibold">Regulamin</h2>
          <button (click)="closeTermsModal()" class="text-stone-400 hover:text-stone-600 transition-colors">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto flex-1 p-6 md:p-8">
          <p class="text-stone-500 text-sm mb-6">Ostatnia aktualizacja: {{ currentDate }}</p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4">§1. Postanowienia ogólne</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Niniejszy regulamin określa zasady korzystania z usług oferowanych przez Restaurację Złota 
            z siedzibą w Warszawie (zwana dalej „Restauracją").<br>
            2. Właścicielem i operatorem Restauracji jest [NAZWA FIRMY], [ADRES FIRMY].<br>
            3. Korzystanie z usług Restauracji oznacza akceptację niniejszego regulaminu.<br>
            4. Restauracja zastrzega sobie prawo do wprowadzania zmian w regulaminie, o czym klienci 
            będą informowani poprzez publikację zmienionego regulaminu na stronie internetowej.
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">§2. Rezerwacje</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Rezerwacje stolików można dokonać telefonicznie, przez formularz na stronie internetowej 
            lub bezpośrednio w restauracji.<br>
            2. Rezerwacja jest potwierdzona po otrzymaniu potwierdzenia od Restauracji.<br>
            3. Restauracja zastrzega sobie prawo do anulowania rezerwacji w przypadku nieprzewidzianych 
            okoliczności, o czym klient zostanie poinformowany jak najszybciej.<br>
            4. W przypadku spóźnienia powyżej 15 minut od zarezerwowanej godziny, Restauracja zastrzega 
            sobie prawo do zwolnienia stolika.<br>
            5. Anulowanie rezerwacji prosimy zgłaszać najpóźniej 2 godziny przed planowaną godziną.
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">§3. Rezerwacje wydarzeń i całego lokalu</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Rezerwacja całego lokalu wymaga wcześniejszego ustalenia szczegółów z zarządem Restauracji.<br>
            2. Rezerwacje wydarzeń wymagają podpisania umowy oraz wpłacenia zaliczki w wysokości 30% 
            wartości zamówienia.<br>
            3. W przypadku rezygnacji z rezerwacji całego lokalu lub wydarzenia:<br>
            &nbsp;&nbsp;- do 7 dni przed terminem - zwrot 100% zaliczki<br>
            &nbsp;&nbsp;- od 3 do 7 dni przed terminem - zwrot 50% zaliczki<br>
            &nbsp;&nbsp;- mniej niż 3 dni przed terminem - brak zwrotu zaliczki
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">§4. Zachowanie w restauracji</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Klienci zobowiązani są do kulturalnego zachowania wobec personelu i innych gości.<br>
            2. W restauracji obowiązuje zakaz palenia tytoniu oraz e-papierosów.<br>
            3. Restauracja zastrzega sobie prawo do odmowy obsługi osobom nietrzeźwym, zachowującym się 
            niestosownie lub łamiącym zasady savoir-vivre.<br>
            4. Za szkody materialne wyrządzone w restauracji odpowiedzialność ponosi osoba je wyrządzająca.
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">§5. Płatności</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Restauracja akceptuje płatności gotówką oraz kartami płatniczymi.<br>
            2. Rachunek wystawiany jest na życzenie klienta.<br>
            3. W przypadku rezerwacji wydarzeń lub całego lokalu, rozliczenie odbywa się według 
            wcześniej ustalonego menu i cennika.
          </p>

          <h3 class="font-display text-xl text-stone-800 font-semibold mb-4 mt-8">§6. Reklamacje</h3>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Reklamacje dotyczące jakości usług lub produktów można składać bezpośrednio w restauracji, 
            telefonicznie lub mailowo.<br>
            2. Reklamacje będą rozpatrywane w ciągu 14 dni od daty zgłoszenia.<br>
            3. Restauracja dokłada wszelkich starań, aby każda reklamacja została rozpatrzona 
            rzetelnie i sprawiedliwie.
          </p>

          <div class="mt-8 pt-6 border-t border-warm-200">
            <p class="text-stone-500 text-sm">
              W przypadku pytań dotyczących regulaminu, prosimy o kontakt:<br>
              Email: kontakt&#64;restauracjazlota.pl<br>
              Telefon: +48 22 123 45 67
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  showPrivacyModal = signal(false);
  showTermsModal = signal(false);
  
  currentDate = new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  openPrivacyModal(): void {
    this.showPrivacyModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closePrivacyModal(): void {
    this.showPrivacyModal.set(false);
    document.body.style.overflow = '';
  }

  openTermsModal(): void {
    this.showTermsModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeTermsModal(): void {
    this.showTermsModal.set(false);
    document.body.style.overflow = '';
  }
}
