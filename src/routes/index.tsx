// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';

export const router = createBrowserRouter([
  {
    path: '/*', // سيب كل حاجة لـ AppRoutes هي اللي تقرر
    element: <AppRoutes />,
  },
]);