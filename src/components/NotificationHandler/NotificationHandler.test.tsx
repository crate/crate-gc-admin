import { notification } from 'antd';
import { disableConsole, render, screen, waitFor } from '../../../test/testUtils';
import useSessionStore from '../../state/session';
import NotificationHandler from './NotificationHandler';

const setup = () => render(<NotificationHandler />);

describe('The NotificationHandler component', () => {
  beforeAll(() => {
    // disabled the console here as the notifications code will be
    // refactored entirely in the near future
    disableConsole('error');
  });

  afterEach(() => {
    notification.destroy();
  });

  it('renders nothing if there is no notification to show', () => {
    const { container } = setup();

    expect(container).toMatchInlineSnapshot(`
      <div>
        <main />
      </div>
    `);
  });

  describe('displaying different notification types', () => {
    it('renders warning messages if the "warn" type is passed', async () => {
      const initialState = useSessionStore.getState();
      await useSessionStore.setState({
        ...initialState,
        notification: { type: 'warn', message: 'this is a warning' },
      });

      const { container } = setup();

      await waitFor(() => {
        expect(
          (container.nextSibling! as HTMLElement).querySelector(
            '.cui-notification-warn',
          ),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('this is a warning')).toBeInTheDocument();
    });

    it('renders error messages if the "error" type is passed', async () => {
      const initialState = useSessionStore.getState();
      useSessionStore.setState({
        ...initialState,
        notification: { type: 'error', message: 'this is an error' },
      });

      const { container } = setup();

      await waitFor(() => {
        expect(
          (container.nextSibling! as HTMLElement).querySelector(
            '.cui-notification-error',
          ),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('this is an error')).toBeInTheDocument();
    });

    it('renders info message if no type property is given', async () => {
      const initialState = useSessionStore.getState();
      useSessionStore.setState({
        ...initialState,
        notification: { message: 'a message without a type' },
      });

      const { container } = setup();

      await waitFor(() => {
        expect(
          (container.nextSibling as HTMLElement).querySelector(
            '.cui-notification-info',
          ),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('a message without a type')).toBeInTheDocument();
    });
  });
});
