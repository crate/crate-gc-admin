import CardIconDescriptor, { CardIconDescriptorProps } from './CardIconDescriptor';
import { render, screen } from 'test/testUtils';

const defaultProps: CardIconDescriptorProps = {
  imageSrc: 'static/media/logo_azure_2021.c0c0bdfcc980e52835dba9fcb29718c2.svg',
  imageAlt: 'Azure logo',
  title: 'Bregenz',
  description: 'bregenz.other',
};

const setup = (props: Partial<CardIconDescriptorProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<CardIconDescriptor {...combinedProps} />);
};

describe('The CardIconDescriptor component', () => {
  it('displays an image with the src provided', () => {
    setup();

    expect(screen.getByRole('img').getAttribute('src')).toBe(
      'static/media/logo_azure_2021.c0c0bdfcc980e52835dba9fcb29718c2.svg',
    );
  });

  it('displays an image with the alt text provided', () => {
    setup();

    expect(screen.getByRole('img').getAttribute('alt')).toBe('Azure logo');
  });

  it('displays a the title as an H3 element', () => {
    setup();

    expect(screen.getByText('Bregenz').nodeName).toBe('H3');
  });

  it('displays a the description', () => {
    setup();

    expect(screen.getByText('bregenz.other')).toBeInTheDocument();
  });
});
