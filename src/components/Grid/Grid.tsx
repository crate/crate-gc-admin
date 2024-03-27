import { PropsWithChildren, ReactElement } from 'react';
import { ValueOf } from 'types/utils';
import { cn } from 'utils';
import { GRID_COLS, GRID_ROWS } from './GridConstants';

type GridValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full' | 'auto';

type GridItemProps = PropsWithChildren<{
  colSpan?: GridValue;
  rowSpan?: GridValue;
  className?: string;
}>;
const GridItem = ({ colSpan, rowSpan, className, children }: GridItemProps) => {
  return (
    <div
      className={cn('flex flex-col', className)}
      style={{
        gridColumn:
          colSpan &&
          (colSpan === 'auto'
            ? 'auto'
            : colSpan === 'full'
              ? 'grid 1  / -1'
              : `span ${colSpan} / span ${colSpan}`),
        gridRow:
          rowSpan &&
          (rowSpan === 'auto'
            ? 'auto'
            : rowSpan === 'full'
              ? 'grid 1  / -1'
              : `span ${rowSpan} / span ${rowSpan}`),
      }}
    >
      {children}
    </div>
  );
};

type GridProps = {
  children: ReactElement<GridItemProps> | ReactElement<GridItemProps>[];
  columns?: ValueOf<typeof GRID_COLS>;
  rows?: ValueOf<typeof GRID_ROWS>;
  className?: string;
};
const Grid = ({
  columns = GRID_COLS.NONE,
  rows = GRID_ROWS.NONE,
  className,
  children,
}: GridProps) => {
  return (
    <div className={cn('flex flex-col md:grid', `${columns}`, `${rows}`, className)}>
      {children}
    </div>
  );
};

Grid.Item = GridItem;
Grid.COLS = GRID_COLS;
Grid.ROWS = GRID_ROWS;

export default Grid;
