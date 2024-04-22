import { useEffect, useState } from 'react';
import { Heading } from 'components';
import { TAILWIND_BREAKPOINT_MD } from 'constants/defaults';
import { SYSTEM_SCHEMAS } from 'constants/database';
import { TableListEntry } from 'types/cratedb';
import TableDetail from './TableDetail';
import TableList from './TableList';

function Tables() {
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
        <Heading level="h1" className="px-2 pt-2">
          Tables
        </Heading>
        <div className={activeTable ? 'hidden' : 'block'}>
          <TableList
            setActiveTable={setActiveTable}
            systemSchemas={SYSTEM_SCHEMAS}
          />
        </div>
        <div className={activeTable ? 'block px-2 pt-4' : 'hidden'}>
          {activeTable && (
            <TableDetail
              activeTable={activeTable}
              setActiveTable={setActiveTable}
              systemSchemas={SYSTEM_SCHEMAS}
            />
          )}
        </div>
      </div>
    );
  }

  // render for desktop
  return (
    <div className="flex h-full overflow-hidden">
      <div className="h-full basis-[370px]">
        <TableList setActiveTable={setActiveTable} systemSchemas={SYSTEM_SCHEMAS} />
      </div>
      <div className="basis-full overflow-y-auto p-6">
        <Heading level="h1">Tables</Heading>
        <div>
          {activeTable && (
            <TableDetail
              activeTable={activeTable}
              setActiveTable={setActiveTable}
              systemSchemas={SYSTEM_SCHEMAS}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Tables;
