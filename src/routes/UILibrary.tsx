import { Button, Loader } from '@crate.io/crate-ui-components';

function UILibrary() {
  return (
    <>
      <h1 className="mb-2 text-2xl">UI Library</h1>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Button kind={Button.kinds.PRIMARY}>Primary Button</Button>
        <Button kind={Button.kinds.SECONDARY}>Secondary Button</Button>
        <Button kind={Button.kinds.TERTIARY}>Tertiary Button</Button>
        <Button loading>Loading Button</Button>
      </div>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Loader color={Loader.colors.PRIMARY} size={Loader.sizes.SMALL} />
        <Loader color={Loader.colors.PRIMARY} size={Loader.sizes.MEDIUM} />
        <Loader color={Loader.colors.PRIMARY} size={Loader.sizes.LARGE} />
      </div>
    </>
  );
}

export default UILibrary;
