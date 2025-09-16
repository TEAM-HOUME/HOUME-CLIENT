import Ghost1Img from '@assets/images/ghost1.png';
import Ghost2Img from '@assets/images/ghost2.png';
import HouseImg from '@assets/images/house.png';

import * as styles from './ErrorImageGroup.css.ts';

export default function ErrorImageGroup() {
  return (
    <div className={styles.wrapper}>
      <img src={HouseImg} className={styles.houseLayer} alt="house" />
      <img
        src={Ghost1Img}
        className={`${styles.layer} ${styles.floatLoop}`}
        alt="ghost1"
      />
      <img
        src={Ghost2Img}
        className={`${styles.layer} ${styles.floatLoop}`}
        alt="ghost2"
      />
    </div>
  );
}
