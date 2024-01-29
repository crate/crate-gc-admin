import cx from 'classnames';
import {
  LOADER_ALIGNMENT_OPTIONS,
  LOADER_COLORS,
  LOADER_SIZES,
} from './LoaderConstants';
import Text from '../Text';
import { ValueOf } from '../../types/utils';

export type LoaderProps = {
  align?: ValueOf<typeof LOADER_ALIGNMENT_OPTIONS>;
  className?: string;
  color?: ValueOf<typeof LOADER_COLORS>;
  message?: React.ReactNode;
  size?: ValueOf<typeof LOADER_SIZES>;
};

function Loader({
  align = 'left',
  color,
  className = '',
  size = LOADER_SIZES.MEDIUM,
  message,
}: LoaderProps) {
  return (
    <div
      className={cx(className, 'relative', 'inline-block', {
        flex: !!message,
        'items-center': !!message,
      })}
      data-testid="crate-loading-spinner"
      role="alert"
      title="loading"
    >
      <svg
        className={cx('animate-spin', 'relative', color ?? '', {
          block: !message && align === 'center',
          'm-auto': !message && align === 'center',
          'mr-2': !!message,
        })}
        fill="none"
        viewBox="0 0 24 24"
        style={{ minWidth: 16, minHeight: 16 }}
        width={size}
        height={size}
      >
        <circle
          className="absolute left-1/2 opacity-25 top-1/2"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      {message && <Text pale>{message}</Text>}
    </div>
  );
}

Loader.alignment = LOADER_ALIGNMENT_OPTIONS;
Loader.colors = LOADER_COLORS;
Loader.sizes = LOADER_SIZES;

export default Loader;
