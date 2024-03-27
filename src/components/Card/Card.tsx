import { Heading } from 'components';
import { PropsWithChildren } from 'react';
import { cn } from 'utils';

export type CardProps = PropsWithChildren<{
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  testId?: string;
  className?: string;
}>;

function Card({
  active = false,
  children,
  disabled = false,
  className = '',
  onClick,
  testId,
  title,
}: CardProps) {
  const cardClasses = cn(
    'bg-white',
    'duration-300',
    'h-full',
    'relative',
    'rounded',
    'p-6',
    'transition-opacity',
    {
      'border-crate-blue': active,
      'cursor-auto': active,
      'bg-crate-blue/10': active,
      border: !!onClick && !disabled,
      'border-crate-border-mid': !!onClick && !disabled,
      'hover:border-crate-blue': !!onClick && !disabled,
      'opacity-50': disabled,
    },
    className,
  );

  const card = (
    <div className={cardClasses} data-testid={testId}>
      {title && <Heading level={Heading.levels.h3}>{title}</Heading>}
      {children}
    </div>
  );

  if (onClick) {
    return (
      <button
        aria-pressed={active}
        className="w-full"
        disabled={active || disabled}
        onClick={onClick}
        type="button"
      >
        {card}
      </button>
    );
  }

  return card;
}
export default Card;
