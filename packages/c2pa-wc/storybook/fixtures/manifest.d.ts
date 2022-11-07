/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */
declare const _default: {
  ingredients: {
    title: string;
    format: string;
    relationship: string;
    manifest: string;
    thumbnail: any;
  }[];
  label: string;
  format: string;
  title: string;
  signature: {
    issuer: string;
    isoDateString: string;
  };
  claimGenerator: {
    value: string;
    product: string;
  };
  producer: {
    '@type': string;
    name: string;
    identifier: string;
    credential: {
      url: string;
      alg: string;
      hash: Uint8Array;
    }[];
  };
  socialAccounts: {
    '@type': string;
    '@id': string;
    name: string;
    identifier: string;
  }[];
  thumbnail: any;
  editsAndActivity: {
    id: string;
    icon: string;
    label: string;
    description: string;
  }[];
  isBeta: boolean;
};
export default _default;
