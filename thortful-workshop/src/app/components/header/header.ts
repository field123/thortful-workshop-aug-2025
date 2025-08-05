import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private destroy$ = new Subject<void>();
  
  basketCount = signal(0);
  
  ngOnInit() {
    this.cartService.itemCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.basketCount.set(count);
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    console.log('Search query:', query);
  }
}