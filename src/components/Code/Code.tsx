import cx from 'classnames';

export type CodeProps = {
  className?: string;
  children: React.ReactNode;
};

function Code({ className, children }: CodeProps) {
  const textClasses = cx(
    'bg-crate-border-light/50 leading-tight pb-0.5 px-1.5 pt-1 rounded',
    className,
  );

  return <code className={textClasses}>{children}</code>;
}

export default Code;
