import TablesShardsMetrics from './TablesShardsMetrics';
import { render, screen, within } from 'test/testUtils';
import server from 'test/msw';

const setup = () => {
  return render(<TablesShardsMetrics />);
};

describe('the TablesShardsMetrics component', () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  describe('the statistics panel', () => {
    it('displays the cluster health', async () => {
      setup();

      const statistic = await screen.findByTestId('statistic-health');
      expect(within(statistic).getByText('Warning')).toBeInTheDocument();
    });

    it('displays the total records', async () => {
      setup();

      const statistic = await screen.findByTestId('statistic-totalRecords');
      expect(within(statistic).getByText('113.2K')).toBeInTheDocument();
    });

    it('displays the total size', async () => {
      setup();

      const statistic = await screen.findByTestId('statistic-totalSize');
      expect(within(statistic).getByText('11.1 MiB')).toBeInTheDocument();
    });

    it('displays the started shards', async () => {
      setup();

      const statistic = await screen.findByTestId('statistic-startedShards');
      expect(within(statistic).getByText('42')).toBeInTheDocument();
    });

    it('displays the missing shards', async () => {
      setup();

      const statistic = await screen.findByTestId('statistic-missingShards');
      expect(within(statistic).getByText('2')).toBeInTheDocument();
    });

    it('displays the underreplicated shards', async () => {
      setup();

      const statistic = await screen.findByTestId('statistic-underreplicatedShards');
      expect(within(statistic).getByText('0')).toBeInTheDocument();
    });
  });

  describe('the list of tables', () => {
    it('displays the table infomation', async () => {
      setup();

      const rows = await screen.findAllByRole('row');

      // "good" health table
      expect(within(rows[3]).getByText('schema_1')).toBeInTheDocument(); // schema
      expect(within(rows[3]).getByText('table_1')).toBeInTheDocument(); // table name
      expect(within(rows[3]).getByText('Good')).toBeInTheDocument(); // health
      expect(within(rows[3]).getByText('6')).toBeInTheDocument(); // shards
      expect(within(rows[3]).getByText('0-1')).toBeInTheDocument(); // replicas
      expect(within(rows[3]).getByText('12')).toBeInTheDocument(); // shards started
      expect(within(rows[3]).getAllByText('0').length).toBe(2); // shards missing + shards underreplicated
      expect(within(rows[3]).getByText('123')).toBeInTheDocument(); // total records
      expect(within(rows[3]).getByText('1.2 KiB')).toBeInTheDocument(); // size

      // "warning" health table
      expect(within(rows[4]).getByText('schema_1')).toBeInTheDocument(); // schema
      expect(within(rows[4]).getByText('table_2')).toBeInTheDocument(); // table name
      expect(within(rows[4]).getByText('Warning')).toBeInTheDocument(); // health
      expect(within(rows[4]).getByText('6')).toBeInTheDocument(); // shards
      expect(within(rows[4]).getByText('0-1')).toBeInTheDocument(); // replicas
      expect(within(rows[4]).getByText('12')).toBeInTheDocument(); // shards started
      expect(within(rows[4]).getByText('2')).toBeInTheDocument(); // shards missing
      expect(within(rows[4]).getByText('0')).toBeInTheDocument(); // shards underreplicated
      expect(within(rows[4]).getByText('234')).toBeInTheDocument(); // total records
      expect(within(rows[4]).getByText('22.6 KiB')).toBeInTheDocument(); // size
    });

    it('displays the partition information (when applicable)', async () => {
      setup();

      const rows = await screen.findAllByRole('row');

      // parent table row
      expect(within(rows[5]).getByText('schema_1')).toBeInTheDocument(); // schema
      expect(within(rows[5]).getByText('table_3')).toBeInTheDocument(); // table name

      // partition #1
      expect(within(rows[6]).queryByText('schema_1')).not.toBeInTheDocument(); // schema
      expect(within(rows[6]).getByText('part_01')).toBeInTheDocument(); // table name

      // partition #2
      expect(within(rows[7]).queryByText('schema_1')).not.toBeInTheDocument(); // schema
      expect(within(rows[7]).getByText('part_02')).toBeInTheDocument(); // table name
    });
  });

  describe('filtering the list of tables', () => {
    it('show all table when unfiltered', async () => {
      setup();

      // count the values
      const table = await screen.findByRole('table');
      expect(within(table).getAllByText('Good').length).toBe(4);
      expect(within(table).getAllByText('Warning').length).toBe(1);
      expect(within(table).queryAllByText('Critical').length).toBe(0);
    });

    it('shows only "good" health tables', async () => {
      const { user } = setup();

      // deselect the warning and critical options
      await user.click(await screen.findByTestId('health-filter'));
      await user.click(screen.getByTestId('filter-checkbox-YELLOW'));
      await user.click(screen.getByTestId('filter-checkbox-RED'));

      // count the values
      const table = await screen.findByRole('table');
      expect(within(table).getAllByText('Good').length).toBe(4);
      expect(within(table).queryAllByText('Warning').length).toBe(0);
      expect(within(table).queryAllByText('Critical').length).toBe(0);
    });

    it('shows only "warning" health tables', async () => {
      const { user } = setup();

      // deselect the good and critical options
      await user.click(await screen.findByTestId('health-filter'));
      await user.click(screen.getByTestId('filter-checkbox-GREEN'));
      await user.click(screen.getByTestId('filter-checkbox-RED'));

      // count the values
      const table = await screen.findByRole('table');
      expect(within(table).queryAllByText('Good').length).toBe(0);
      expect(within(table).getAllByText('Warning').length).toBe(1);
      expect(within(table).queryAllByText('Critical').length).toBe(0);
    });

    it('shows only "critical" health tables', async () => {
      const { user } = setup();

      // deselect the good and warning options
      await user.click(await screen.findByTestId('health-filter'));
      await user.click(screen.getByTestId('filter-checkbox-GREEN'));
      await user.click(screen.getByTestId('filter-checkbox-YELLOW'));

      // count the values
      const table = await screen.findByRole('table');
      expect(within(table).queryAllByText('Good').length).toBe(0);
      expect(within(table).queryAllByText('Warning').length).toBe(0);
      expect(within(table).queryAllByText('Critical').length).toBe(0);
    });
  });
});
