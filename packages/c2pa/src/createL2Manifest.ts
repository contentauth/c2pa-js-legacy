/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Manifest } from './manifest';
import { selectProducer } from './selectors/selectProducer';
import { selectEditsAndActivity } from './selectors/selectEditsAndActivity';
import { selectSocialAccounts } from './selectors/selectSocialAccounts';
import { Disposable } from './lib/types';

declare module './assertions' {
  interface ExtendedAssertions {
    'adobe.beta': {
      version: string;
    };
  }
}

export interface L2Manifest {
  ingredients: L2Ingredient[];
  format: string;
  title: string;
  signature: L2Signature | null;
  claimGenerator: L2ClaimGenerator;
  producer: L2Producer | null;
  socialAccounts: L2SocialAccount[] | null;
  thumbnail: string | null;
  editsAndActivity: L2EditsAndActivity[] | null;
  isBeta: boolean;
}

interface L2Ingredient {
  title: string;
  format: string;
  thumbnail: string | null;
}

interface L2Signature {
  issuer: string | null;
  isoDateString: string | null;
}

interface L2ClaimGenerator {
  value: string;
  product: string;
}

interface L2Producer {
  '@type': string;
  name: string;
  identifier: string;
}

interface L2SocialAccount {
  '@type': string;
  '@id': string | undefined;
  name: string;
  identifier: string;
}

interface L2EditsAndActivity {
  id: string;
  icon: string | null;
  label: string;
  description: string;
}

type DisposableL2Manifest = Disposable<{ manifest: L2Manifest }>;

/**
 * Creates a manifest representation suitable for use with c2pa-wc.
 *
 * @param manifest c2pa manifest object
 */
export async function createL2Manifest(
  manifest: Manifest,
): Promise<DisposableL2Manifest> {
  const disposers: (() => void)[] = [];

  const ingredients: L2Ingredient[] = manifest.ingredients.map((ingredient) => {
    const thumbnail = ingredient.thumbnail?.getUrl();

    if (thumbnail) {
      disposers.push(thumbnail.dispose);
    }

    return {
      title: ingredient.title,
      format: ingredient.format,
      thumbnail: thumbnail?.url ?? null,
    };
  });

  const producer = selectProducer(manifest);

  const editsAndActivity = await selectEditsAndActivity(manifest);

  const socialAccounts =
    selectSocialAccounts(manifest)?.map((socialAccount) => ({
      '@type': socialAccount['@type'],
      '@id': socialAccount['@id'],
      name: socialAccount.name,
      identifier: socialAccount.identifier,
    })) ?? null;

  const thumbnail = manifest.thumbnail?.getUrl();

  if (thumbnail) {
    disposers.push(thumbnail.dispose);
  }

  return {
    manifest: {
      ingredients,
      format: manifest.format,
      title: manifest.title,
      signature: manifest.signatureInfo
        ? {
            issuer: manifest.signatureInfo.issuer ?? null,
            isoDateString: manifest.signatureInfo.time ?? null,
          }
        : null,
      claimGenerator: {
        value: manifest.claimGenerator,
        product: manifest.claimGenerator.split('(')[0]?.trim(),
      },
      producer: producer
        ? {
            '@type': producer['@type'],
            name: producer.name,
            identifier: producer.identifier,
          }
        : null,
      socialAccounts,
      editsAndActivity,
      thumbnail: thumbnail?.url ?? null,
      isBeta: !!manifest.assertions.get('adobe.beta')?.[0]?.data.version,
    },
    dispose: () => {
      disposers.forEach((dispose) => dispose());
    },
  };
}
