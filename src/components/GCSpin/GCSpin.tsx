import { PropsWithChildren } from 'react';
import { Spin } from 'antd';

export type GCSpinParams = PropsWithChildren<{
  spinning: boolean;
  spinnedTestId?: string;
}>;

function GCSpin({ children, spinning, spinnedTestId = 'spinner' }: GCSpinParams) {
  if (!spinning) {
    return children;
  }
  return <Spin data-testid={spinnedTestId} />;
}

export default GCSpin;
