import { Button } from "@crate/crate-ui-components";

function App() {
  return (
    <div>
      <Button kind={Button.kinds.PRIMARY}>Primary Button</Button>
      <Button kind={Button.kinds.SECONDARY}>Secondary Button</Button>
      <Button kind={Button.kinds.TERTIARY}>Tertiary Button</Button>
      <Button loading>Loading Button</Button>
    </div>
  );
}

export default App;
