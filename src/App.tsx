import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/router';

import Test from './pages/imageSetup/temp/Test';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
