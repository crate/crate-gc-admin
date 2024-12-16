import { render, screen } from 'test/testUtils';
import { ColumnType } from 'types/query';
import TypeAwareValue, { TypeAwareValueParams } from './TypeAwareValue';

const setup = (props: TypeAwareValueParams) => render(<TypeAwareValue {...props} />);

describe('The TypeAwareValue component', () => {
  describe('when a crate type is specified', () => {
    it('will render a number nicely', () => {
      setup({ value: 222, columnType: ColumnType.INTEGER });

      const elem = screen.getByText('222');
      expect(elem.className).toBe('text-crate-blue');
    });

    it('will render a date nicely', () => {
      setup({ value: 222, columnType: ColumnType.TIMESTAMP_WITH_TZ });

      const elem = screen.getByText('222');
      expect(elem.nextSibling?.childNodes[1]).toHaveClass('text-crate-blue');
      expect(elem.nextSibling?.childNodes[1]).toHaveTextContent(
        '1970-01-01T00:00:00.222Z',
      );
    });

    it('will render a url', () => {
      setup({ value: 'http://crate.io', columnType: ColumnType.TEXT });

      const elem = screen.getByRole('link');
      expect(elem).toHaveAttribute('href', 'http://crate.io/');
    });

    it('will render an array', () => {
      setup({ value: [1, 2, 3], columnType: ColumnType.ARRAY });

      const elem = screen.getByText('Array');
      expect(elem.children[0]).toHaveTextContent('[3]');
    });

    it('will render an object', async () => {
      const { user } = setup({
        value: { MyKey: 'b' },
        columnType: ColumnType.ARRAY,
      });

      await user.click(screen.getByText('Object'));
      expect(screen.getByText('MyKey:')).toBeInTheDocument();
    });

    it('will render a geopoint', () => {
      setup({ value: [53.370351, -1.470883], columnType: ColumnType.GEOPOINT });

      expect(screen.getByText('[53.370351,-1.470883]')).toBeInTheDocument();
      expect(screen.getByTestId('geopoint-link').getAttribute('href')).toBe(
        'https://www.openstreetmap.org/?mlat=-1.470883&mlon=53.370351',
      );
    });

    it('will render a geoshape', () => {
      setup({
        value: {
          coordinates: [
            [
              [16.344, 48.137],
              [16.344, 48.261],
              [16.462, 48.261],
              [16.462, 48.137],
              [16.344, 48.137],
            ],
          ],
          type: 'Polygon',
        },
        columnType: ColumnType.GEOSHAPE,
      });

      expect(screen.getByText('Type: Polygon')).toBeInTheDocument();
      expect(screen.getByTestId('geoshape-link').getAttribute('href')).toBe(
        'http://geojson.io/#data=data:application/json,{"coordinates":[[[16.344,48.137],[16.344,48.261],[16.462,48.261],[16.462,48.137],[16.344,48.137]]],"type":"Polygon"}',
      );
    });

    it('will render a float vector', () => {
      setup({ value: [1, 2], columnType: ColumnType.FLOAT_VECTOR });

      const elem = screen.getByText('Array');
      expect(elem.children[0]).toHaveTextContent('[2]');
    });
  });

  describe('when a crate type is not specified', () => {
    it('will render a number', () => {
      setup({ value: 222 });

      const elem = screen.getByText('222');
      expect(elem.className).toBe('text-crate-blue');
    });

    it('will render a url', () => {
      setup({ value: 'http://crate.io' });

      const elem = screen.getByRole('link');
      expect(elem).toHaveAttribute('href', 'http://crate.io/');
    });

    it('will render null', () => {
      setup({ value: null });

      const elem = screen.getByText('null');
      expect(elem.className).toBe('text-crate-blue');
    });

    it('will render an object', async () => {
      const { user } = setup({
        value: { MyKey: 'b' },
      });

      await user.click(screen.getByText('Object'));
      expect(screen.getByText('MyKey:')).toBeInTheDocument();
    });
  });
});
