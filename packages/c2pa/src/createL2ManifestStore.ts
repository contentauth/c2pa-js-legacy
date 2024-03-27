/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ValidationStatus } from '@contentauth/toolkit';
import { hasErrorStatus, hasOtgpStatus } from './lib/validationStatus';
import { ManifestStore } from './manifestStore';
import { selectFormattedGenerator } from './selectors/selectFormattedGenerator';
import {
  GenerativeInfo,
  selectGenerativeInfo,
} from './selectors/selectGenerativeInfo';
import { selectProducer } from './selectors/selectProducer';
import { selectSocialAccounts } from './selectors/selectSocialAccounts';
import { selectWeb3 } from './selectors/web3Info';

declare module './assertions' {
  interface ExtendedAssertions {
    'adobe.beta': {
      version: string;
    };
  }
}

export type ErrorStatus = 'otgp' | 'error' | null;

/**
 * Manifest representation suitable for use with c2pa-wc.
 */
export interface L2ManifestStore {
  format: string;
  title: string;
  signature: L2Signature | null;
  claimGenerator: L2ClaimGenerator;
  producer: L2Producer | null;
  socialAccounts: L2SocialAccount[] | null;
  thumbnail: string | null;
  generativeInfo: GenerativeInfo[] | null;
  web3: L2Web3 | null;
  isBeta: boolean;
  error: ErrorStatus;
  validationStatus: ValidationStatus[];
}

export interface L2Signature {
  issuer: string | null;
  isoDateString: string | null;
}

export interface L2ClaimGenerator {
  value: string;
  product: string;
}

export interface L2Producer {
  '@type': string;
  name: string;
  identifier: string;
}

export interface L2SocialAccount {
  '@type': string;
  '@id': string | undefined;
  name: string;
  identifier: string;
}

export interface L2Web3 {
  ethereum?: string[] | undefined;
  solana?: string[] | undefined;
}

export type DisposableL2ManifestStore = {
  manifestStore: L2ManifestStore;
  dispose: () => void;
};

/**
 * Creates a manifest store representation suitable for use with c2pa-wc.
 *
 * @param manifestStore - c2pa manifest store object
 */
export async function createL2ManifestStore(
  manifestStore: ManifestStore,
): Promise<DisposableL2ManifestStore> {
  const disposers: (() => void)[] = [];
  const activeManifest = manifestStore.activeManifest;

  const producer = selectProducer(activeManifest);

  const socialAccounts =
    selectSocialAccounts(activeManifest)?.map((socialAccount) => ({
      '@type': socialAccount['@type'],
      '@id': socialAccount['@id'],
      name: socialAccount.name,
      identifier: socialAccount.identifier,
    })) ?? null;

  const thumbnail = activeManifest.thumbnail?.getUrl();

  if (thumbnail) {
    disposers.push(thumbnail.dispose);
  }

  return {
    manifestStore: {
      format: activeManifest.format,
      title: activeManifest.title,
      signature: activeManifest.signatureInfo
        ? {
            issuer: activeManifest.signatureInfo.issuer ?? null,
            isoDateString: activeManifest.signatureInfo.time ?? null,
          }
        : null,
      claimGenerator: {
        value: activeManifest.claimGenerator,
        product: selectFormattedGenerator(activeManifest),
      },
      producer: producer
        ? {
            '@type': producer['@type'],
            name: producer.name,
            identifier: producer.identifier,
          }
        : null,
      socialAccounts,
      thumbnail: thumbnail?.url ?? null,
      isBeta: !!activeManifest.assertions.get('adobe.beta')?.[0]?.data.version,
      generativeInfo: selectGenerativeInfo(activeManifest),
      web3: selectWeb3(activeManifest) ?? null,
      error: getErrorStatus(manifestStore.validationStatus),
      validationStatus: manifestStore.validationStatus,
    },
    dispose: () => {
      disposers.forEach((dispose) => dispose());
    },
  };
}

function getErrorStatus(validationStatus: ValidationStatus[]): ErrorStatus {
  return hasOtgpStatus(validationStatus)
    ? 'otgp'
    : hasErrorStatus(validationStatus)
    ? 'error'
    : null;
}
