import { PropsWithChildren } from 'react';

function CustomPreTag({ children }: PropsWithChildren) {
  return <pre className="bg-neutral-100 p-2 rounded-lg">{children}</pre>;
}

export default CustomPreTag;
