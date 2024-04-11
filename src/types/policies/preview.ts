import { z } from 'zod';
import {
  PolicyFormSchemaInput,
  PolicyPartitioningFormSchemaInput,
  PolicyTargetInput,
} from './input';

// Policy Preview
export type TPolicyTargetInput = z.infer<typeof PolicyTargetInput>;
export type TPolicyPartitioningInput = z.infer<
  typeof PolicyPartitioningFormSchemaInput
>;

export const PolicyPreviewBody = PolicyFormSchemaInput.omit({
  name: true,
  enabled: true,
  actions: true,
});

export type TPolicyPreviewBody = z.infer<typeof PolicyPreviewBody>;
