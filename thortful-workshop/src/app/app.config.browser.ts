import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideNgxStripe } from 'ngx-stripe';
import { appConfig } from './app.config';
import { environment } from '../environments/environment';

const browserConfig: ApplicationConfig = {
  providers: [
    provideNgxStripe(environment.stripe?.publishableKey || 'pk_test_placeholder', {
      stripeAccount: environment.stripe?.connectAccountId!
    })
  ]
};

export const config = mergeApplicationConfig(appConfig, browserConfig);
