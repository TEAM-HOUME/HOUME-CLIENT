import * as styles from './CompareTab.css';
import CompareSearch from './search/CompareSearch';

const CompareTab = () => {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <CompareSearch />
      </div>
    </section>
  );
};

export default CompareTab;
