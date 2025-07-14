import NodesMetrics from './NodesMetrics';
import { Heading } from 'components';

function Nodes() {
  return (
    <div className="p-4">
      <Heading level={Heading.levels.h1} className="mb-2">
        Nodes
      </Heading>
      <NodesMetrics />
    </div>
  );
}

export default Nodes;
