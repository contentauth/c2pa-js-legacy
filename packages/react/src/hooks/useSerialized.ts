/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Serializable, Disposable } from 'c2pa';
import { useEffect, useState } from 'react';

export function useSerialized<ReturnType extends Disposable>(
  serializableObject: Serializable<Promise<ReturnType>> | undefined | null,
): Awaited<ReturnType>['data'] | undefined {
  const [serialized, setSerialized] = useState<ReturnType>();

  useEffect(() => {
    let disposeFn: Disposable['dispose'] = () => {};

    async function serialize() {
      if (serializableObject) {
        const { data, dispose } = await serializableObject.asSerializable();
        setSerialized(data);

        disposeFn = dispose;
      }
    }

    serialize();

    return disposeFn;
  }, [serializableObject]);

  return serialized;
}
