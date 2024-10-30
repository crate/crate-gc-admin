import { PropsWithChildren } from 'react';
import { Spin } from 'antd';

export type GCSpinParams = PropsWithChildren<{
  spinning: boolean;
  spinnerTestId?: string;
}>;

function GCSpin({ children, spinning, spinnerTestId = 'spinner' }: GCSpinParams) {
  if (!spinning) {
    return children;
  }
  return <Spin data-testid={spinnerTestId} />;
}

export default GCSpin;
