import * as styles from './FilterChip.css';

interface FilterChipProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  isSelected?: boolean;
}
const FilterChip = ({
  children,
  isSelected = false,
  ...props
}: FilterChipProps) => {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={styles.filterChip({
        selected: isSelected,
      })}
      {...props}
    >
      {children}
    </button>
  );
};

export default FilterChip;
