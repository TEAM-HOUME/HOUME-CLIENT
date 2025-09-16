import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/router';

import OverlayTest from './shared/components/overlay/modal/OverlayTest';

function App() {
  // return <RouterProvider router={router} />;
  return <OverlayTest />;
}

export default App;
