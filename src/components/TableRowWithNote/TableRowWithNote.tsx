import { Table } from 'components/Table/Table';
import React from 'react';
import cn from 'utils/cn';

export type TableRowWithNoteProps = {
  rowId: string;
  cells: React.ReactNode[];
  note: React.ReactNode;
  dataState: string;
  hoveredRowGroup: string | null;
  setHoveredRowGroup: (id: string | null) => void;
};

function TableRowWithNote({
  rowId,
  cells,
  note,
  dataState,
  hoveredRowGroup,
  setHoveredRowGroup,
}: TableRowWithNoteProps) {
  return (
    <React.Fragment key={rowId}>
      <Table.Row
          key={rowId}
          data-state={dataState}
          data-row-key={rowId}
          className={cn(
          "border-b-0",
          hoveredRowGroup === rowId && 'bg-table-row-hover',
          )}
          onMouseEnter={() => setHoveredRowGroup(rowId)}
          onMouseLeave={() => setHoveredRowGroup(null)}
      >
          {...cells}
      </Table.Row>
      <Table.Row 
        className={cn(
            hoveredRowGroup === rowId && 'bg-table-row-hover',
        )}
        onMouseEnter={() => setHoveredRowGroup(rowId)}
        onMouseLeave={() => setHoveredRowGroup(null)}
      >
        {note}
      </Table.Row>
    </React.Fragment>
  );
}

export default TableRowWithNote;
