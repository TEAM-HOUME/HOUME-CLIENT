import Lottie from 'lottie-react';

import loadingAnimation from '../../assets/lottie/loading.json';

const LoadingLottie = () => {
  return (
    <div>
      <Lottie
        animationData={loadingAnimation}
        style={{ width: 200, height: 200 }}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};

export default LoadingLottie;
