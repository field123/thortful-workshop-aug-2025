import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card';
import { CartService } from '../../services/cart.service';

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
  
  private cartService = inject(CartService);
  
  toggleFavorite(event: Event, card: Card) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Toggle favorite:', card.title);
  }
  
  async addToCart(event: Event, card: Card) {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      await this.cartService.addToCart(card.id, 1);
      alert(`${card.title} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  }
}