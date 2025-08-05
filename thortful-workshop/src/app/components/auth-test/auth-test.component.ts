import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { getByContextAllProducts } from '@epcc-sdk/sdks-shopper';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-test">
      <h2>Elastic Path Authentication Test</h2>
      
      <div class="status">
        <p>Authentication Status: {{ isAuthenticated() ? 'Authenticated' : 'Not Authenticated' }}</p>
        <p>Client ID: {{ clientId }}</p>
        <p>Base URL: {{ baseUrl }}</p>
      </div>

      <div class="actions">
        <button (click)="testAuthentication()" [disabled]="loading()">
          {{ loading() ? 'Testing...' : 'Test Authentication' }}
        </button>
        
        <button (click)="clearAuth()">Clear Authentication</button>
      </div>

      @if (error()) {
        <div class="error">
          <h3>Error:</h3>
          <pre>{{ error() }}</pre>
        </div>
      }

      @if (result()) {
        <div class="result">
          <h3>Success!</h3>
          <p>Products found: {{ result() }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .auth-test {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .status {
      background: #f0f0f0;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    
    .status p {
      margin: 5px 0;
    }
    
    .actions {
      margin: 20px 0;
      display: flex;
      gap: 10px;
    }
    
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    
    button:hover {
      background: #0056b3;
    }
    
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .error {
      background: #fee;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border: 1px solid #fcc;
    }
    
    .result {
      background: #efe;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border: 1px solid #cfc;
    }
    
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class AuthTestComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<string | null>(null);
  
  clientId: string;
  baseUrl: string;

  constructor(public authService: AuthService) {
    this.clientId = this.authService.getClientId() || 'Not configured';
    this.baseUrl = this.authService.getBaseUrl();
  }

  ngOnInit() {
    // Initialize authentication on component load
    if (this.authService.getClientId()) {
      this.initializeAuth();
    }
  }

  async initializeAuth() {
    try {
      await this.authService.ensureValidToken();
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
    }
  }

  async testAuthentication() {
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);

    try {
      // Ensure we have a valid token
      await this.authService.ensureValidToken();
      
      // Test API call - get products
      const response = await getByContextAllProducts();
      
      // The response.data contains the products array
      const products = response.data;
      const productCount = Array.isArray(products) ? products.length : 0;
      this.result.set(`${productCount} products`);
    } catch (error: any) {
      this.error.set(error.message || 'Authentication test failed');
    } finally {
      this.loading.set(false);
    }
  }

  clearAuth() {
    this.authService.clearTokens();
    this.error.set(null);
    this.result.set(null);
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }
}