import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { SERVER_COOKIE_PROVIDER } from './providers/server-cookie.provider';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    SERVER_COOKIE_PROVIDER
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
