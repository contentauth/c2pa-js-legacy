/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { C2paReadResult, C2paSourceType } from 'c2pa';
import { useEffect, useState } from 'react';
import { useC2paContext } from './useC2paContext';

export function useC2pa(input: C2paSourceType | undefined) {
  const c2paContext = useC2paContext();
  const [result, setResult] = useState<C2paReadResult | undefined>();

  useEffect(() => {
    async function read() {
      if (c2paContext && input) {
        const readResult = await c2paContext.read(input);
        setResult(readResult);
      }
    }

    read();
  }, [c2paContext, input]);

  return result;
}
