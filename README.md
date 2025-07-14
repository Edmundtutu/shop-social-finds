## Project info

## Feature Checklist: Social Commerce PWA

### Success Criteria & Current Status

- [x] **PWA installable on mobile devices with offline capability**  
  - Uses `vite-plugin-pwa` and `workbox-window` for manifest, offline, and installability (see `vite.config.ts`).
- [x] **Role-based authentication with smooth transitions between user types**  
  - Role-based auth (`customer`, `vendor`, `guest`) with protected routes and context (`AuthContext`, `authService`, `AppRoutes.tsx`).
- [~] **Real-time social feed with product discovery**  
  - Social feed, posts, reviews, and discovery features are scaffolded (`shopService`, `Home`, `Discover`, `Product`, `Profile`), but real-time (websocket) is not yet implemented.
- [x] **Interactive map showing nearby shops and inventory**  
  - `ShopMap` uses `react-leaflet` and geolocation to show shops and user location.
- [~] **Complete ordering flow from cart to fulfillment tracking**  
  - Cart, order, and fulfillment types/services/routes exist, but some UI/API hooks are marked as TODO.
- [x] **Vendor dashboard with inventory management and analytics**  
  - Vendor dashboard, inventory, orders, analytics, and profile pages are present and routed.
- [x] **Responsive design optimized for mobile-first usage**  
  - Uses Tailwind CSS, mobile breakpoints, and responsive layouts throughout.
- [~] **Integration-ready for Laravel Breeze backend**  
  - API layer (`api.ts`, `authService.ts`, `shopService.ts`) is set up for `/api` endpoints, CSRF, and Laravel Sanctum, but Inertia.js integration is not yet implemented.

Legend: [x] = Complete, [~] = Partial, [ ] = Not started

---

## How to Integrate with Laravel 12 + Inertia.js Backend

This project is designed as a React PWA frontend, ready to connect to a Laravel backend using Inertia.js for a seamless full-stack SPA experience.

### 1. **Set Up Laravel 12 Backend**
- Install Laravel 12:  
  [Official Docs: Installation](https://laravel.com/docs/12.x/installation)
- Install Laravel Breeze with Inertia.js + React stack:  
  [Breeze Docs: Inertia + React](https://laravel.com/docs/12.x/starter-kits#breeze-and-inertia)
  ```sh
  composer require laravel/breeze --dev
  php artisan breeze:install react
  npm install && npm run dev
  php artisan migrate
  ```
- Configure your `.env` for database, mail, and other services as needed.

### 2. **Configure Inertia.js**
- Inertia.js allows Laravel to serve React pages as SPA views, with server-side routing and props.
- [Inertia.js Docs: Laravel Adapter](https://inertiajs.com/server-side-setup)
- Ensure your Laravel routes use `Inertia::render()` for pages you want React to control.

### 3. **API & Auth Integration**
- This PWA expects `/api` endpoints for authentication, products, shops, orders, etc.
- Use Laravel's API routes (`routes/api.php`) for backend logic.
- Sanctum is already referenced in the frontend for CSRF/auth.  
  [Sanctum Docs](https://laravel.com/docs/12.x/sanctum)
- Make sure CORS is configured to allow your frontend origin.  
  [CORS Docs](https://laravel.com/docs/12.x/sanctum#cors-and-spas)

### 4. **Connect React Frontend to Laravel Backend**
- In production, you can serve the React build (`npm run build`) as static assets from Laravel's `public/` directory, or deploy separately and set API URLs accordingly.
- In development, use the Vite dev server and set up a proxy in `vite.config.ts`:
  ```js
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    }
  }
  ```
- Update `API_BASE_URL` in your frontend if your API is not at `/api`.

### 5. **Inertia Page Integration (Optional)**
- If you want to use Inertia for page transitions (not just API), move your React app into Laravel's `resources/js` and let Inertia handle routing and props.
- [Inertia.js Docs: Shared Data](https://inertiajs.com/shared-data)

### 6. **Best Practices & References**
- Always consult the [Laravel 12.x Documentation](https://laravel.com/docs/12.x/) for up-to-date guidance.
- For upgrades, see the [Upgrade Guide](https://laravel.com/docs/12.x/upgrade).
- Use `^12.0` constraints in `composer.json`.
- Backup your database and code before migrations or upgrades.
- Run tests after integration.

---

## Notes
- This project is frontend-only and expects a Laravel backend for full functionality.
- For any backend changes, always follow the official Laravel documentation and upgrade guides.
