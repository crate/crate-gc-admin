import { notification } from 'antd';
import { actWithFakeTimers, disableConsole } from 'test/testUtils';
import { infoNotification } from './notificationPresets';

describe('the notification presets', () => {
  const notificationSpy = jest.spyOn(notification, 'open');

  beforeAll(() => {
    // disabled the console here as the notifications code will be
    // refactored entirely in the near future
    disableConsole('error');
  });

  afterEach(() => {
    notificationSpy.mockReset();
  });

  afterAll(() => {
    notificationSpy.mockRestore();
  });

  it('defaults the notification duration to 15 if the description is longer than 100 characters', () => {
    actWithFakeTimers(() => {
      infoNotification({
        message: 'The Message',
        description:
          'This is a very long message with some complex instructions and more time is needed to display this message',
      });
    });

    expect(notificationSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        duration: 15,
      }),
    );
  });

  it('allows config properties to be overwritten', () => {
    actWithFakeTimers(() => {
      infoNotification({
        message: 'This is a customised info message',
        description: 'A specialised info description',
        key: 'foo',
        duration: null,
      });
    });

    expect(notificationSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        message: 'This is a customised info message',
        description: 'A specialised info description',
        key: 'foo',
        duration: null,
      }),
    );
  });
});
