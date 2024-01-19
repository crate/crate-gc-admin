import { PropsWithChildren } from 'react';
import { Spin } from 'antd';

type GCSpinParams = PropsWithChildren<{
  spinning: boolean;
}>;

function GCSpin({ children, spinning }: GCSpinParams) {
  if (!spinning) {
    return children;
  }
  return <Spin data-testid="spinner" />;
}

export default GCSpin;
