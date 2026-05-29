import { useState } from 'react';
import { useRfq, QuoteRequest } from '@ston-fi/omniston-sdk-react';

export function Test() {
  const [req, setReq] = useState<QuoteRequest | undefined>();
  const res = useRfq(req as any);
  return null;
}
