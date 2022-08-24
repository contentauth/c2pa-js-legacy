/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import React, { createContext, useEffect, ReactNode, useState } from 'react';
import { createC2pa, C2paConfig, C2pa } from 'c2pa';

export interface C2paProviderProps {
  config: C2paConfig;
  children: ReactNode;
}

export type C2paContextValue = C2pa | null;

export const C2paContext = createContext<C2paContextValue>(null);

export function C2paProvider({ config, children }: C2paProviderProps) {
  const [c2paState, setC2paState] = useState<null | C2pa>(null);

  useEffect(() => {
    async function initC2pa() {
      const c2pa = await createC2pa(config);
      setC2paState(c2pa);
    }

    initC2pa();

    return () => {
      c2paState?.dispose();
    };
  }, []);

  return (
    <C2paContext.Provider value={c2paState}>{children}</C2paContext.Provider>
  );
}
