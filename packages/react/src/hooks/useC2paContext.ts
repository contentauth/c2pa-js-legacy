/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { useContext } from 'react';
import { C2paContext, C2paContextValue } from './C2paProvider';

export function useC2paContext(): C2paContextValue {
  const ctxValue = useContext(C2paContext);

  if (
    process.env.NODE_ENV !== 'production' &&
    typeof ctxValue === 'undefined'
  ) {
    throw new Error(
      'C2pa context not available; ensure a <C2paProvider> exists in the component ancestry',
    );
  }

  return ctxValue;
}
