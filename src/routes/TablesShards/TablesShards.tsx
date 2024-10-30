import { Heading } from 'components';
import TablesShardsMetrics from './TablesShardsMetrics';

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
