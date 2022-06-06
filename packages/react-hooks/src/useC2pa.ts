/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { C2paReadResult, C2paSourceType, ManifestResolvers } from 'c2pa';
import { useEffect, useState } from 'react';
import { useC2paContext } from './useC2paContext';

export function useC2pa<T extends ManifestResolvers = {}>(
  input: C2paSourceType | undefined,
) {
  const promisedC2pa = useC2paContext();
  const [result, setResult] = useState<C2paReadResult<T> | undefined>();

  useEffect(() => {
    const read = async () => {
      if (promisedC2pa && input) {
        const c2pa = await promisedC2pa;
        const readResult = await c2pa.read(input);
        setResult(readResult as C2paReadResult<T>);
      }
    };

    read();
  }, [promisedC2pa, input]);

  return result;
}
