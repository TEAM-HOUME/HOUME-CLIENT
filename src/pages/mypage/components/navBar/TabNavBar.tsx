import * as styles from './TabNavBar.css';

interface TabNavBarProps {
  activeTab: 'savedItems' | 'generatedImages';
  onTabChange: (tab: 'savedItems' | 'generatedImages') => void;
}

const TabNavBar = ({ activeTab, onTabChange }: TabNavBarProps) => {
  return (
    <div className={styles.tabNavBar}>
      <button
        className={styles.tabButton({
          state: activeTab === 'generatedImages' ? 'active' : 'inactive',
        })}
        onClick={() => onTabChange('generatedImages')}
      >
        <div className={styles.tabButtonText}>생성된 이미지</div>
      </button>

      <button
        className={styles.tabButton({
          state: activeTab === 'savedItems' ? 'active' : 'inactive',
        })}
        onClick={() => onTabChange('savedItems')}
      >
        <div className={styles.tabButtonText}>찜한 가구</div>
      </button>
    </div>
  );
};

export default TabNavBar;
