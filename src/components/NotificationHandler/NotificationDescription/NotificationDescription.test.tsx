import NotificationDescription from './NotificationDescription';
import { render, screen } from 'test/testUtils';

const mockMessages = [{ keyName: 'key', text: 'text' }];

describe('NotificationDescription', () => {
  it('displays the messages in a list if an array is given', () => {
    render(<NotificationDescription messages={mockMessages} />);

    expect(screen.getByText('text').previousElementSibling!.textContent).toBe(
      'key: ',
    );
  });

  it('displays just the message if a string literal is passed as the message', () => {
    render(<NotificationDescription messages="just render it" />);

    expect(screen.getByText('just render it')).toBeInTheDocument();
  });
});
