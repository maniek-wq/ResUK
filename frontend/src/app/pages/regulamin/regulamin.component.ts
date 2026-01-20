import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-regulamin',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="min-h-screen bg-warm-50">
      <!-- Header -->
      <div class="bg-white border-b border-warm-200 py-8">
        <div class="container mx-auto px-6">
          <h1 class="font-display text-3xl md:text-4xl text-stone-800 font-bold mb-2">Regulamin</h1>
          <p class="text-stone-500">Ostatnia aktualizacja: {{ currentDate }}</p>
        </div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-6 py-12">
        <div class="max-w-4xl mx-auto bg-white rounded-sm shadow-sm p-8 md:p-12 prose prose-stone max-w-none">
          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4">§1. Postanowienia ogólne</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Niniejszy regulamin określa zasady korzystania z usług oferowanych przez Restaurację Złota 
            z siedzibą w Warszawie (zwana dalej „Restauracją”).<br>
            2. Właścicielem i operatorem Restauracji jest [NAZWA FIRMY], [ADRES FIRMY].<br>
            3. Korzystanie z usług Restauracji oznacza akceptację niniejszego regulaminu.<br>
            4. Restauracja zastrzega sobie prawo do wprowadzania zmian w regulaminie, o czym klienci 
            będą informowani poprzez publikację zmienionego regulaminu na stronie internetowej.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">§2. Rezerwacje</h2>
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

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">§3. Rezerwacje wydarzeń i całego lokalu</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Rezerwacja całego lokalu wymaga wcześniejszego ustalenia szczegółów z zarządem Restauracji.<br>
            2. Rezerwacje wydarzeń wymagają podpisania umowy oraz wpłacenia zaliczki w wysokości 30% 
            wartości zamówienia.<br>
            3. W przypadku rezygnacji z rezerwacji całego lokalu lub wydarzenia:<br>
            &nbsp;&nbsp;- do 7 dni przed terminem - zwrot 100% zaliczki<br>
            &nbsp;&nbsp;- od 3 do 7 dni przed terminem - zwrot 50% zaliczki<br>
            &nbsp;&nbsp;- mniej niż 3 dni przed terminem - brak zwrotu zaliczki
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">§4. Zachowanie w restauracji</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Klienci zobowiązani są do kulturalnego zachowania wobec personelu i innych gości.<br>
            2. W restauracji obowiązuje zakaz palenia tytoniu oraz e-papierosów.<br>
            3. Restauracja zastrzega sobie prawo do odmowy obsługi osobom nietrzeźwym, zachowującym się 
            niestosownie lub łamiącym zasady savoir-vivre.<br>
            4. Za szkody materialne wyrządzone w restauracji odpowiedzialność ponosi osoba je wyrządzająca.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">§5. Płatności</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Restauracja akceptuje płatności gotówką oraz kartami płatniczymi.<br>
            2. Rachunek wystawiany jest na życzenie klienta.<br>
            3. W przypadku rezerwacji wydarzeń lub całego lokalu, rozliczenie odbywa się według 
            wcześniej ustalonego menu i cennika.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">§6. Reklamacje</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Reklamacje dotyczące jakości usług lub produktów można składać bezpośrednio w restauracji, 
            telefonicznie lub mailowo.<br>
            2. Reklamacje będą rozpatrywane w ciągu 14 dni od daty zgłoszenia.<br>
            3. Restauracja dokłada wszelkich starań, aby każda reklamacja została rozpatrzona 
            rzetelnie i sprawiedliwie.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">§7. Ochrona danych osobowych</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. Dane osobowe klientów przetwarzane są zgodnie z Polityką Prywatności dostępną na stronie 
            internetowej Restauracji.<br>
            2. Restauracja zobowiązuje się do ochrony danych osobowych zgodnie z przepisami RODO.
          </p>

          <h2 class="font-display text-2xl text-stone-800 font-semibold mb-4 mt-8">§8. Postanowienia końcowe</h2>
          <p class="text-stone-600 leading-relaxed mb-6">
            1. W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego.<br>
            2. Ewentualne spory będą rozstrzygane przez sąd właściwy dla siedziby Restauracji.<br>
            3. Restauracja zastrzega sobie prawo do odmowy obsługi bez podania przyczyny.
          </p>

          <div class="mt-12 pt-8 border-t border-warm-200">
            <p class="text-stone-500 text-sm">
              W przypadku pytań dotyczących regulaminu, prosimy o kontakt:<br>
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
export class RegulaminComponent {
  currentDate = new Date().toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
