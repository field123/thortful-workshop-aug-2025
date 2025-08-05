import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardGridComponent } from '../card-grid/card-grid';
import { CardDataService } from '../../services/card-data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardGridComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  private cardDataService = inject(CardDataService);
  
  birthdayCards = computed(() => {
    return this.cardDataService.getCardsByCategory('birthday').slice(0, 4);
  });
  
  onNewsletterSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    console.log('Newsletter signup:', email);
    alert('Thanks for signing up! (This is a demo)');
    form.reset();
  }
}