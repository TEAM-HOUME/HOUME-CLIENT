import { RouterProvider } from 'react-router-dom';

import { router } from '@routes/router';

import { useAppUpdateToast } from '@hooks/useAppUpdateToast';

function App() {
  useAppUpdateToast();

  return <RouterProvider router={router} />;
}

export default App;
