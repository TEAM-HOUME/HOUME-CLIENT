import * as styles from './TapNavBar.css';

interface TapNavBarProps {
  activeTab: 'saveditem' | 'genImg';
  onTabChange: (tab: 'saveditem' | 'genImg') => void;
}

const TapNavBar = ({ activeTab, onTabChange }: TapNavBarProps) => {
  return (
    <div className={styles.tapNavBar}>
      <button
        className={styles.tapButton({
          state: activeTab === 'saveditem' ? 'active' : 'inactive',
        })}
        onClick={() => onTabChange('saveditem')}
      >
        <div className={styles.tapButtonText}>생성된 이미지</div>
      </button>

      <button
        className={styles.tapButton({
          state: activeTab === 'genImg' ? 'active' : 'inactive',
        })}
        onClick={() => onTabChange('genImg')}
      >
        <div className={styles.tapButtonText}>찜한 가구</div>
      </button>
    </div>
  );
};

export default TapNavBar;
