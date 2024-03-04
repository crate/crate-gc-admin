import DisplayDateDifference, {
  DisplayDateDifferenceProps,
} from './DisplayDateDifference';
import { render } from 'test/testUtils';

const defaultProps: DisplayDateDifferenceProps = {
  to: '2024-01-01T00:00:00.000Z',
  from: '2024-02-01T00:00:00.000Z',
};

const setup = (props: Partial<DisplayDateDifferenceProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<DisplayDateDifference {...combinedProps} />);
};

describe('The DisplayDateDifference component', () => {
  describe('for minutes', () => {
    it('shows correctly "Less than 1 minute ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:30.000Z',
        to: '2025-01-10T12:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 1 minute ago');
    });

    it('shows correctly "More than 1 minute ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2025-01-10T11:58:58.000Z',
      });

      expect(container.textContent).toBe('More than 1 minute ago');
    });

    it('shows correctly "Less than 10 minutes ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:09:58.000Z',
        to: '2025-01-10T12:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 10 minutes ago');
    });

    it('shows correctly "More than 10 minutes ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2025-01-10T11:49:58.000Z',
      });

      expect(container.textContent).toBe('More than 10 minutes ago');
    });
  });

  describe('for hours', () => {
    it('shows correctly "Less than 1 hour ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:59:59.000Z',
        to: '2025-01-10T12:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 1 hour ago');
    });

    it('shows correctly "More than 1 hour ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2025-01-10T10:58:58.000Z',
      });

      expect(container.textContent).toBe('More than 1 hour ago');
    });

    it('shows correctly "Less than 10 hours ago"', () => {
      const { container } = setup({
        from: '2025-01-10T21:59:58.000Z',
        to: '2025-01-10T12:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 10 hours ago');
    });

    it('shows correctly "More than 10 hours ago"', () => {
      const { container } = setup({
        from: '2025-01-10T22:01:01.000Z',
        to: '2025-01-10T12:00:00.000Z',
      });

      expect(container.textContent).toBe('More than 10 hours ago');
    });
  });

  describe('for days', () => {
    it('shows correctly "Less than 1 day ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2025-01-09T12:59:00.000Z',
      });

      expect(container.textContent).toBe('Less than 1 day ago');
    });

    it('shows correctly "More than 1 day ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2025-01-09T10:58:58.000Z',
      });

      expect(container.textContent).toBe('More than 1 day ago');
    });

    it('shows correctly "Less than 2 days ago"', () => {
      const { container } = setup({
        from: '2025-01-10T00:00:00.000Z',
        to: '2025-01-08T01:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 2 days ago');
    });

    it('shows correctly "More than 2 days ago"', () => {
      const { container } = setup({
        from: '2025-01-12T22:01:01.000Z',
        to: '2025-01-10T12:00:00.000Z',
      });

      expect(container.textContent).toBe('More than 2 days ago');
    });
  });

  describe('for weeks', () => {
    it('shows correctly "Less than 1 week ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2025-01-03T12:59:00.000Z',
      });

      expect(container.textContent).toBe('Less than 1 week ago');
    });

    it('shows correctly "More than 1 week ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2025-01-03T10:58:58.000Z',
      });

      expect(container.textContent).toBe('More than 1 week ago');
    });

    it('shows correctly "Less than 2 weeks ago"', () => {
      const { container } = setup({
        from: '2025-01-10T00:00:00.000Z',
        to: '2024-12-28T01:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 2 weeks ago');
    });

    it('shows correctly "More than 2 weeks ago"', () => {
      const { container } = setup({
        from: '2025-01-12T22:01:01.000Z',
        to: '2024-12-29T12:00:00.000Z',
      });

      expect(container.textContent).toBe('More than 2 weeks ago');
    });
  });

  describe('for months', () => {
    it('shows correctly "Less than 1 month ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2024-12-11T12:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 1 month ago');
    });

    it('shows correctly "More than 1 month ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2024-12-10T10:58:58.000Z',
      });

      expect(container.textContent).toBe('More than 1 month ago');
    });

    it('shows correctly "Less than 2 months ago"', () => {
      const { container } = setup({
        from: '2025-01-10T00:00:00.000Z',
        to: '2024-11-11T01:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 2 months ago');
    });

    it('shows correctly "More than 2 months ago"', () => {
      const { container } = setup({
        from: '2025-01-12T22:01:01.000Z',
        to: '2024-11-12T12:00:00.000Z',
      });

      expect(container.textContent).toBe('More than 2 months ago');
    });
  });

  describe('for years', () => {
    it('shows correctly "Less than 1 year ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2024-01-12T12:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 1 year ago');
    });

    it('shows correctly "More than 1 year ago"', () => {
      const { container } = setup({
        from: '2025-01-10T12:00:00.000Z',
        to: '2024-01-10T10:58:58.000Z',
      });

      expect(container.textContent).toBe('More than 1 year ago');
    });

    it('shows correctly "Less than 2 years ago"', () => {
      const { container } = setup({
        from: '2025-01-10T00:00:00.000Z',
        to: '2023-01-12T01:00:00.000Z',
      });

      expect(container.textContent).toBe('Less than 2 years ago');
    });

    it('shows correctly "More than 2 years ago"', () => {
      const { container } = setup({
        from: '2025-01-12T22:01:01.000Z',
        to: '2023-01-12T12:00:00.000Z',
      });

      expect(container.textContent).toBe('More than 2 years ago');
    });
  });
});
