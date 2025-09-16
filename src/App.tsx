import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/router';

import GeneralModal from './shared/components/overlay/modal/GeneralModal';
import GeneralModalTest from './shared/components/overlay/modal/GeneralModalTest';
import OverlayTest from './shared/components/overlay/modal/OverlayTest';

function App() {
  // return <RouterProvider router={router} />;
  return <GeneralModalTest />;
}

export default App;
