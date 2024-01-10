import { Button, Loader } from '@crate.io/crate-ui-components';

function UILibrary() {
  return (
    <>
      <h1 className="mb-2 text-2xl">UI Library</h1>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Button kind="primary">Primary Button</Button>
        <Button kind="primary">Secondary Button</Button>
        <Button kind="primary">Tertiary Button</Button>
        <Button loading>Loading Button</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Loader color="primary" size="small" />
        <Loader color="primary" size="medium" />
        <Loader color="primary" size="large" />
      </div>
    </>
  );
}

export default UILibrary;
