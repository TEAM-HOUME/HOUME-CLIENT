import * as styles from './MenuTab.css';

interface MenuTabItem<T extends string = string> {
  value: T;
  label: string;
}
interface MenuTabProps<T extends string> {
  menuType?: 'default' | 'mypage';
  tabs: MenuTabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  sticky?: boolean;
}

const MenuTab = <T extends string>({
  menuType = 'default',
  tabs,
  activeTab,
  onTabChange,
  sticky = true,
}: MenuTabProps<T>) => {
  return (
    <div className={styles.menuTabBar({ sticky })} role="tablist">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={activeTab === value}
          className={styles.tabButton({
            state: activeTab === value ? 'active' : 'inactive',
            menuType,
          })}
          onClick={() => onTabChange(value)}
        >
          <span className={styles.tabButtonText}>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default MenuTab;
