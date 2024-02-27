import { PropsWithChildren } from 'react';

function CustomPreTag({ children }: PropsWithChildren) {
  return <pre className="rounded-lg bg-neutral-100 p-2">{children}</pre>;
}

export default CustomPreTag;
