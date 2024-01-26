import { useEffect, useState } from 'react';
import { Heading } from '@crate.io/crate-ui-components';
import TableDetail from './TableDetail';
import TableList from './TableList';
import { TAILWIND_BREAKPOINT_MD } from '../../constants/defaults';
import { TableListEntry } from '../../utils/queries';

function Tables() {
  const systemSchemas = ['information_schema', 'sys', 'pg_catalog', 'gc'];
  const [isMobile, setIsMobile] = useState(false);
  const [activeTable, setActiveTable] = useState<TableListEntry | undefined>();

  // get the screen width: we render the components in a different
  // order depending on the screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= TAILWIND_BREAKPOINT_MD);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // render for mobile
  if (isMobile) {
    return (
      <div className="flex flex-col">
        <Heading level="h1" className="pt-2 px-2">
          Tables
        </Heading>
        <div className={activeTable ? 'hidden' : 'block'}>
          <TableList setActiveTable={setActiveTable} systemSchemas={systemSchemas} />
        </div>
        <div className={activeTable ? 'block pt-4 px-2' : 'hidden'}>
          <TableDetail
            activeTable={activeTable}
            setActiveTable={setActiveTable}
            systemSchemas={systemSchemas}
          />
        </div>
      </div>
    );
  }

  // render for desktop
  return (
    <div className="flex h-full overflow-hidden">
      <div className="basis-[370px] h-full">
        <TableList setActiveTable={setActiveTable} systemSchemas={systemSchemas} />
      </div>
      <div className="basis-full overflow-y-auto p-6">
        <Heading level="h1">Tables</Heading>
        <div>
          <TableDetail
            activeTable={activeTable}
            setActiveTable={setActiveTable}
            systemSchemas={systemSchemas}
          />
        </div>
      </div>
    </div>
  );
}

export default Tables;
