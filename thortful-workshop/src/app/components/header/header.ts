import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  basketCount = signal(0);
  
  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    console.log('Search query:', query);
  }
}