# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Core Development Commands
- `pnpm install` - Install dependencies (use pnpm, not npm)
- `pnpm start` - Start development server on http://localhost:4200
- `pnpm build` - Build production bundle
- `pnpm test` - Run unit tests with Karma
- `pnpm run serve:ssr:thortful-workshop` - Run SSR server on port 4000

### Testing Commands
- `pnpm test` - Run all unit tests
- `pnpm test -- --watch=false` - Run tests once without watching
- `pnpm test -- --code-coverage` - Generate coverage report

### Angular CLI Commands
- `pnpm ng generate component <name>` - Generate new component
- `pnpm ng generate service <name>` - Generate new service
- `pnpm ng generate pipe <name>` - Generate new pipe

## Architecture Overview

This is an Angular 20.1 application with Server-Side Rendering (SSR) using modern Angular patterns:

### Key Architectural Decisions

1. **Standalone Components**: All components use the standalone API without NgModules
2. **Zoneless Change Detection**: Application runs without Zone.js using `provideZonelessChangeDetection()`
3. **Signals**: Uses Angular's signals API for reactive state management
4. **SSR with Express**: Full server-side rendering with Express server integration

### Project Structure

- `src/app/` - Application components and logic
  - `app.ts` - Root component using signals and standalone API
  - `app.config.ts` - Browser-side configuration
  - `app.config.server.ts` - Server-side configuration
  - `app.routes.ts` - Route definitions (currently empty)
- `src/server.ts` - Express server setup for SSR
- `src/main.ts` - Browser bootstrap
- `src/main.server.ts` - Server bootstrap

### Configuration Files

- `angular.json` - Angular workspace configuration with SSR setup
- `tsconfig.json` - TypeScript strict mode enabled with ES2022 target
- `package.json` - Project configuration and dependencies

### Important Development Notes

1. **Package Manager**: Always use `pnpm`, not `npm` or `yarn`
2. **TypeScript Strict Mode**: All TypeScript strict checks are enabled
3. **No Zone.js**: Don't import Zone.js or use Zone-dependent features
4. **SSR Considerations**: Ensure code works in both browser and Node.js environments
5. **Testing**: Unit tests use Karma + Jasmine, no E2E tests configured by default