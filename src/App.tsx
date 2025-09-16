import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/router';

import ToastTest from './shared/components/toast/ToastTest';

function App() {
  // return <RouterProvider router={router} />;
  return <ToastTest />;
}

export default App;
