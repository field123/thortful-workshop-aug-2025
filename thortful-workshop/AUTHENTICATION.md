# Elastic Path Authentication Setup

This Angular application is configured with Elastic Path authentication using the Shopper SDK.

## Overview

The authentication system implements:
- Implicit token generation for API access
- Automatic token refresh on expiration
- Support for Account Management Authentication tokens
- Secure token storage in localStorage
- SDK interceptors for automatic token attachment

## Configuration

### Environment Settings

Update the environment files with your Elastic Path credentials:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  elasticPath: {
    clientId: 'YOUR_CLIENT_ID',
    endpointUrl: 'YOUR_API_ENDPOINT'
  }
};
```

## Key Components

### AuthService (`src/app/services/auth.service.ts`)

The main authentication service that handles:
- SDK configuration
- Token generation and storage
- Token expiration checking
- Automatic token refresh
- Support for both implicit and account tokens

### Key Methods:

- `generateImplicitToken()`: Generates a new implicit token
- `ensureValidToken()`: Checks token validity and refreshes if needed
- `setAccountToken(token)`: Sets the account management token
- `clearTokens()`: Clears all stored tokens

### Usage Example

```typescript
// In a component
constructor(private authService: AuthService) {}

async ngOnInit() {
  try {
    // Ensure we have a valid token before making API calls
    await this.authService.ensureValidToken();
    
    // Now you can make API calls
    const products = await getByContextAllProducts();
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

## Authentication Flow

1. **Initial Load**: The AuthService loads any stored tokens from localStorage
2. **Token Generation**: If no valid token exists, a new implicit token is generated
3. **Automatic Attachment**: SDK interceptors automatically attach tokens to all API requests
4. **Token Refresh**: Expired tokens are automatically refreshed on 401 errors

## Testing Authentication

A test component is included at `src/app/components/auth-test/auth-test.component.ts` that demonstrates:
- Token generation
- Making authenticated API calls
- Displaying authentication status

Access the test UI at http://localhost:4200 when running the development server.

## Security Considerations

- Tokens are stored in localStorage (vulnerable to XSS)
- For production, consider:
  - Using HttpOnly cookies for token storage
  - Implementing server-side token management
  - Adding CSRF protection
  - Using shorter token expiration times

## Account Management Authentication

For personalized shopping experiences, you can add Account Management Authentication:

```typescript
// After user login
const accountToken = await authenticateUser(username, password);
this.authService.setAccountToken(accountToken);
```

This enables access to:
- User-specific carts
- Order history
- Saved addresses
- Account-specific pricing

## Troubleshooting

### Token Not Being Sent
- Check that the SDK is properly configured with the base URL
- Verify tokens are stored in localStorage
- Check browser console for errors

### 401 Unauthorized Errors
- Ensure your client ID is correct
- Check that the endpoint URL matches your store
- Verify the token hasn't expired

### CORS Issues
- Ensure your Elastic Path store allows requests from your domain
- Check browser console for CORS-related errors