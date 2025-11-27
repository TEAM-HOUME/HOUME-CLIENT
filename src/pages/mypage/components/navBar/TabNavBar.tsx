import {
  logMyPageClickTabFurniture,
  logMyPageClickTabImg,
} from '@/pages/mypage/utils/analytics';

import * as styles from './TabNavBar.css';

interface TabNavBarProps {
  activeTab: 'savedItems' | 'generatedImages';
  onTabChange: (tab: 'savedItems' | 'generatedImages') => void;
}

const TabNavBar = ({ activeTab, onTabChange }: TabNavBarProps) => {
  const handleTabChange = (tab: 'savedItems' | 'generatedImages') => {
    if (tab === 'generatedImages') {
      logMyPageClickTabImg();
    } else {
      logMyPageClickTabFurniture();
    }
    onTabChange(tab);
  };

  return (
    <div className={styles.tabNavBar}>
      <button
        className={styles.tabButton({
          state: activeTab === 'generatedImages' ? 'active' : 'inactive',
        })}
        onClick={() => handleTabChange('generatedImages')}
      >
        <div className={styles.tabButtonText}>생성된 이미지</div>
      </button>

      <button
        className={styles.tabButton({
          state: activeTab === 'savedItems' ? 'active' : 'inactive',
        })}
        onClick={() => handleTabChange('savedItems')}
      >
        <div className={styles.tabButtonText}>찜한 가구</div>
      </button>
    </div>
  );
};

export default TabNavBar;
