import NoDataView, { NoDataViewProps } from './NoDataView';
import { render, screen } from 'test/testUtils';

const defaultProps: NoDataViewProps = {};

const setup = (props: Partial<NoDataViewProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };

  return render(<NoDataView {...combinedProps} />);
};

describe('The NoDataView component', () => {
  describe('by default', () => {
    it('does not display an image', () => {
      setup();

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows a default description', () => {
      setup();

      expect(
        screen.getByText('There is currently no data to display'),
      ).toBeInTheDocument();
    });
  });

  describe('when a custom image src is passed', () => {
    it('displays the custom image', () => {
      setup({
        imageSrc: 'https://static.thenounproject.com/png/3973819-200.png',
      });

      expect(screen.getByRole('img').getAttribute('src')).toBe(
        'https://static.thenounproject.com/png/3973819-200.png',
      );
    });
  });

  describe('when a custom description is passed', () => {
    it('displays the custom description', () => {
      setup({
        description: 'There are no clusters to display',
      });

      expect(
        screen.getByText('There are no clusters to display'),
      ).toBeInTheDocument();
    });
  });

  describe('when displaying child nodes', () => {
    it('displays the child nodes', () => {
      setup({
        children: <div>The child nodes</div>,
      });

      expect(screen.getByText('The child nodes')).toBeInTheDocument();
    });
  });
});
