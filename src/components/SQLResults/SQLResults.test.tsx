import { useSchemaTreeMock } from 'test/__mocks__/useSchemaTreeMock';
import SQLResults, { SQLResultsProps } from './SQLResults';
import { render, screen } from 'test/testUtils';

const defaultProps: SQLResultsProps = {
  results: [
    {
      status: 'SUCCESS',
      result: useSchemaTreeMock,
    },
  ],
};

const setup = (props?: Partial<SQLResultsProps>) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<SQLResults {...combinedProps} />);
};

describe('The SQLResults component', () => {
  describe('when multiple queries has been executed', () => {
    it('shows one tab for each query', () => {
      setup({
        results: [
          {
            status: 'SUCCESS',
            result: useSchemaTreeMock,
          },
          {
            status: 'SUCCESS',
            result: useSchemaTreeMock,
          },
        ],
      });

      expect(screen.getAllByRole('tab').length).toBe(2);
    });
  });

  describe('when only one query has been executed', () => {
    it('does not show the tabs', () => {
      setup();

      expect(screen.getByRole('tablist')).toHaveClass('hidden');
    });
  });
});
