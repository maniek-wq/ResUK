import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-polityka-prywatnosci',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="min-h-screen bg-warm-50">
      <!-- Header -->
      <div class="bg-white border-b border-warm-200 py-8">
        <div class="container mx-auto px-6">
          <h1 class="font-display text-3xl md:text-4xl text-stone-800 font-bold mb-2">Polityka Prywatności</h1>
          <p class="text-stone-500">Ostatnia aktualizacja: {{ currentDate }}</p>
        </div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-6 py-12">
        <div class="max-w-4xl mx-auto bg-white rounded-sm shadow-sm p-8 md:p-12 prose prose-stone max-w-none">
          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4">1. Informacje ogólne</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych 
            przekazanych przez Użytkowników w związku z korzystaniem przez nich z usług Restauracji Złota 
            (zwana dalej „Restauracją"), dostępnych za pośrednictwem strony internetowej.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">2. Administrator danych</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Administratorem danych osobowych jest:<br>
            [NAZWA FIRMY]<br>
            [ADRES FIRMY]<br>
            NIP: [NUMER NIP]<br>
            REGON: [NUMER REGON]<br><br>
            Kontakt z Administratorem: kontakt@restauracjazlota.pl
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">3. Zakres zbieranych danych</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Restauracja przetwarza następujące dane osobowe:<br>
            1. Dane przekazane w formularzu rezerwacji: imię, nazwisko, numer telefonu, adres e-mail;<br>
            2. Dane przekazane telefonicznie przy rezerwacji;<br>
            3. Dane zbierane automatycznie podczas korzystania ze strony internetowej (adres IP, 
            typ przeglądarki, czas wizyty, strony odwiedzone) - więcej informacji w sekcji dotyczącej plików cookies.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">4. Cel przetwarzania danych</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Dane osobowe są przetwarzane w następujących celach:<br>
            1. Realizacja rezerwacji stolików i wydarzeń;<br>
            2. Kontakt z klientami w sprawie rezerwacji;<br>
            3. Wysyłka potwierdzeń rezerwacji;<br>
            4. Marketing własnych usług (za zgodą klienta);<br>
            5. Prowadzenie statystyk i analiz;<br>
            6. Wypełnienie obowiązków prawnych ciążących na Restauracji.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">5. Podstawa prawna przetwarzania</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Przetwarzanie danych osobowych odbywa się na podstawie:<br>
            1. Art. 6 ust. 1 lit. b RODO - wykonanie umowy (rezerwacja);<br>
            2. Art. 6 ust. 1 lit. a RODO - zgoda osoby, której dane dotyczą (marketing);<br>
            3. Art. 6 ust. 1 lit. f RODO - prawnie uzasadniony interes administratora (analizy, statystyki);<br>
            4. Art. 6 ust. 1 lit. c RODO - obowiązek prawny.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">6. Okres przechowywania danych</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Dane osobowe przechowywane są przez okres niezbędny do realizacji celów, dla których 
            zostały zebrane, nie dłużej jednak niż przez okres 5 lat od momentu ostatniego kontaktu.<br>
            2. W przypadku wyrażenia zgody na marketing - do momentu jej odwołania.<br>
            3. Dane mogą być przechowywane dłużej, jeśli jest to wymagane przepisami prawa lub w celu 
            dochodzenia roszczeń.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">7. Udostępnianie danych</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Dane osobowe mogą być udostępniane:<br>
            1. Dostawcom usług IT i hostingowych;<br>
            2. Dostawcom systemów do obsługi rezerwacji;<br>
            3. Organom państwowym na podstawie obowiązujących przepisów prawa;<br>
            4. Innym podmiotom wyłącznie za wyraźną zgodą osoby, której dane dotyczą.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">8. Prawa użytkownika</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Każda osoba ma prawo do:<br>
            1. Dostępu do swoich danych osobowych;<br>
            2. Sprostowania danych;<br>
            3. Usunięcia danych (prawo do bycia zapomnianym);<br>
            4. Ograniczenia przetwarzania;<br>
            5. Przenoszenia danych;<br>
            6. Wniesienia sprzeciwu wobec przetwarzania;<br>
            7. Wniesienia skargi do organu nadzorczego (UODO).<br><br>
            Aby skorzystać z powyższych praw, należy skontaktować się z Administratorem.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">9. Pliki cookies</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Strona internetowa wykorzystuje pliki cookies. Szczegółowe informacje znajdują się w 
            <a routerLink="/polityka-cookies" class="text-brown-700 hover:text-brown-800 underline">Polityce Cookies</a>.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">10. Bezpieczeństwo danych</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Restauracja stosuje odpowiednie środki techniczne i organizacyjne zapewniające ochronę 
            przetwarzanych danych osobowych przed nieuprawnionym dostępem, utratą, zniszczeniem lub 
            modyfikacją.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">11. Zmiany w polityce prywatności</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            Restauracja zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. 
            O wszelkich zmianach Użytkownicy będą informowani poprzez publikację zaktualizowanej wersji 
            na stronie internetowej.
          </p>

          <div class="mt-12 pt-8 border-t border-warm-200">
            <p class="text-stone-500 text-sm">
              W przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt:<br>
              Email: kontakt@restauracjazlota.pl<br>
              Telefon: +48 22 123 45 67
            </p>
          </div>

          <div class="mt-8">
            <a routerLink="/" class="inline-flex items-center gap-2 text-brown-700 hover:text-brown-800 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              <span>Powrót do strony głównej</span>
            </a>
          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `
})
export class PolitykaPrywatnosciComponent {
  currentDate = new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
