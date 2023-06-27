import { Domain } from './types/domain';

export function domain<
  DT extends 'boolean' | 'number' | 'object' | 'string' = any
>(domain: Domain): Domain<DT> {
  return {
    htmlType: 'text',
    ...domain,
  };
}
