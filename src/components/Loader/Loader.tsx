import {
  LOADER_ALIGNMENT_OPTIONS,
  LOADER_COLORS,
  LOADER_SIZES,
} from './LoaderConstants';
import { ValueOf } from 'types/utils';
import Text from 'components/Text';
import cx from 'classnames';

export type LoaderProps = {
  align?: ValueOf<typeof LOADER_ALIGNMENT_OPTIONS>;
  className?: string;
  color?: ValueOf<typeof LOADER_COLORS>;
  message?: React.ReactNode;
  size?: ValueOf<typeof LOADER_SIZES>;
  testId?: string;
};

function Loader({
  align = 'left',
  color = LOADER_COLORS.PRIMARY,
  className = '',
  size = LOADER_SIZES.MEDIUM,
  message,
  testId = 'crate-loading-spinner',
}: LoaderProps) {
  return (
    <div
      className={cx(className, 'relative', 'inline-block', {
        flex: !!message,
        'items-center': !!message,
      })}
      data-testid={testId}
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
        style={{
          minWidth: LOADER_SIZES.EXTRA_SMALL,
          minHeight: LOADER_SIZES.EXTRA_SMALL,
        }}
        width={size}
        height={size}
      >
        <circle
          className="absolute left-1/2 top-1/2 opacity-25"
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
