import { createBrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';

export const router = createBrowserRouter([
  {
    path: '*',
    element: <AppRoutes />,
  },
]);