import TablesShardsMetrics from './TablesShardsMetrics';
import { Heading } from 'components';

function TablesShards() {
  return (
    <div className="p-4">
      <Heading level={Heading.levels.h1} className="mb-2">
        Tables Shards
      </Heading>
      <TablesShardsMetrics />
    </div>
  );
}

export default TablesShards;
