import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css'
})
export class CheckoutSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  orderId: string | null = null;

  ngOnInit() {
    // Get order ID from query params
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || null;
    });
  }
}