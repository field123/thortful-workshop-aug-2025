import { Injectable, signal } from '@angular/core';
import { Card } from '../models/card';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CardDataService {
  private mockCards: Card[] = [
    {
      id: '1',
      title: 'Happy Birthday Sunshine',
      creator: 'DesignsByLouise',
      price: 3.99,
      imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400',
      category: 'birthday',
      recipient: 'anyone',
      style: 'cute',
      tags: ['birthday', 'cute', 'colorful'],
      isBestseller: true
    },
    {
      id: '2',
      title: 'Another Year Older, None the Wiser',
      creator: 'FunnyCards Co',
      price: 3.49,
      originalPrice: 4.99,
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
      category: 'birthday',
      recipient: 'male',
      style: 'funny',
      tags: ['birthday', 'funny', 'age']
    },
    {
      id: '3',
      title: 'Happy Anniversary My Love',
      creator: 'Romantic Designs',
      price: 4.99,
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
      category: 'anniversary',
      recipient: 'couple',
      style: 'romantic',
      tags: ['anniversary', 'love', 'romantic'],
      isNew: true
    },
    {
      id: '4',
      title: 'Congrats on Your Wedding',
      creator: 'Elegant Cards',
      price: 5.99,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
      category: 'wedding',
      recipient: 'couple',
      style: 'classic',
      tags: ['wedding', 'congratulations', 'elegant']
    },
    {
      id: '5',
      title: 'Birthday Dinosaur Adventure',
      creator: 'Kids Corner',
      price: 3.99,
      imageUrl: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400',
      category: 'kids-birthday',
      recipient: 'child',
      style: 'cute',
      tags: ['birthday', 'kids', 'dinosaur'],
      isBestseller: true
    },
    {
      id: '6',
      title: '30th Birthday Milestone',
      creator: 'Modern Greetings',
      price: 4.49,
      imageUrl: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400',
      category: 'birthday',
      recipient: 'anyone',
      style: 'modern',
      tags: ['birthday', '30th', 'milestone']
    }
  ];

  private categories: Category[] = [
    {
      id: 'birthday',
      name: 'Birthday',
      slug: 'birthday',
      description: 'Celebrate another year with our unique birthday cards',
      subcategories: [
        { id: 'funny-birthday', name: 'Funny', slug: 'birthday/funny' },
        { id: 'cute-birthday', name: 'Cute', slug: 'birthday/cute' },
        { id: 'rude-birthday', name: 'Rude', slug: 'birthday/rude' }
      ]
    },
    {
      id: 'anniversary',
      name: 'Anniversary',
      slug: 'anniversary',
      description: 'Mark your special milestone with love'
    },
    {
      id: 'wedding',
      name: 'Wedding',
      slug: 'wedding',
      description: 'Congratulate the happy couple'
    },
    {
      id: 'kids-birthday',
      name: 'Kids Birthday',
      slug: 'birthday/child',
      description: 'Fun and colorful cards for children'
    }
  ];

  cards = signal(this.mockCards);
  
  getCards() {
    return this.cards();
  }

  getCardsByCategory(category: string) {
    return this.cards().filter(card => card.category === category);
  }

  getCardById(id: string) {
    return this.cards().find(card => card.id === id);
  }

  getCategories() {
    return this.categories;
  }

  searchCards(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return this.cards().filter(card => 
      card.title.toLowerCase().includes(lowercaseQuery) ||
      card.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}