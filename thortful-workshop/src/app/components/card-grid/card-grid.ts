import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card';

@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-grid.html',
  styleUrl: './card-grid.css'
})
export class CardGridComponent {
  @Input() cards: Card[] = [];
  @Input() showCreator = true;
  
  toggleFavorite(event: Event, card: Card) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Toggle favorite:', card.title);
  }
}