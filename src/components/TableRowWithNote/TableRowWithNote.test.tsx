import TableRowWithNote, { TableRowWithNoteProps } from './TableRowWithNote';
import { render, screen, within, fireEvent } from 'test/testUtils';
import Table from 'components/Table';

const setHoveredRowGroupMock = jest.fn();

const defaultProps: TableRowWithNoteProps = {
  rowId: '1',
  cells: [<td key="cell1">Cell 1</td>],
  note: <td>Note content</td>,
  dataState: 'selected',
  hoveredRowGroup: null,
  setHoveredRowGroup: setHoveredRowGroupMock,
};

const setup = (props: Partial<TableRowWithNoteProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(
    <Table>
      <Table.Body>
        <TableRowWithNote {...combinedProps} />
      </Table.Body>
    </Table>,
  );
};

describe('The TableRowWithNote component', () => {
  it('renders the cells in the first row', () => {
    setup({
      ...defaultProps,
      cells: [<td key="cell1">Cell 1</td>, <td key="cell2">Cell 2</td>],
    });

    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
  });

  it('renders the note in the second row', () => {
    setup();

    const noteRow = screen.getByTestId('note-row');
    expect(noteRow).toBeInTheDocument();
    expect(within(noteRow).getByText('Note content')).toBeInTheDocument();
  });

  it('applies the hovered style to both rows when hoveredRowGroup matches the rowId', () => {
    setup({ ...defaultProps, hoveredRowGroup: '1' });

    const firstRow = screen.getByText('Cell 1').closest('tr');
    const noteRow = screen.getByTestId('note-row');

    expect(firstRow).toHaveClass('bg-table-row-hover');
    expect(noteRow).toHaveClass('bg-table-row-hover');
  });

  it('calls setHoveredRowGroup with the rowId on mouse enter on the first row', async () => {
    const { user } = setup();

    const firstRow = screen.getByText('Cell 1').closest('tr');
    await user.hover(firstRow!);

    expect(setHoveredRowGroupMock).toHaveBeenCalledWith('1');
  });

  it('calls setHoveredRowGroup with the rowId on mouse enter on the note row', async () => {
    const { user } = setup();

    const noteRow = screen.getByTestId('note-row');
    await user.hover(noteRow!);

    expect(setHoveredRowGroupMock).toHaveBeenCalledWith('1');
  });

  it('calls setHoveredRowGroup with null on mouse leave on the first row', () => {
    setup();

    const firstRow = screen.getByText('Cell 1').closest('tr');
    fireEvent.mouseLeave(firstRow!);

    expect(setHoveredRowGroupMock).toHaveBeenCalledWith(null);
  });

  it('calls setHoveredRowGroup with null on mouse leave on the first row', () => {
    setup();

    const noteRow = screen.getByTestId('note-row');
    fireEvent.mouseLeave(noteRow!);

    expect(setHoveredRowGroupMock).toHaveBeenCalledWith(null);
  });
});
