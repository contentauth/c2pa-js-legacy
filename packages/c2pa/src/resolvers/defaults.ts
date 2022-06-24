/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { parseISO } from 'date-fns';
import { Author, CreativeWorkAssertion } from '@contentauth/toolkit';
import { createTypedResolvers } from './createTypedResolvers';
import { createThumbnail } from '../thumbnail';

export const defaultResolvers = createTypedResolvers({
  format: (manifest) => manifest.data.asset?.format,

  /**
   * Gets the title of the acquisition asset for this claim if it exists (e.g. filename)
   */
  title: (manifest) => manifest.data.asset?.title,

  /**
   * Gets the signature information (issuer, date) for this claim
   */
  signature: {
    get: ({ data: { signature_info } }) => ({
      issuer: signature_info?.issuer,
      date: signature_info?.time ? parseISO(signature_info?.time) : undefined,
      isoDateString: signature_info?.time,
    }),
    getSerializable: ({ data: { signature_info } }) => ({
      issuer: signature_info?.issuer,
      isoDateString: signature_info?.time,
    }),
  },

  /**
   * Information identifying the software that generated this manifest
   */
  claimGenerator: (manifest) => ({
    value: manifest.data.claim_generator,
    product: manifest.data.claim_generator.split('(')[0]?.trim(),
  }),

  /**
   * Gets the producer from the CreativeWork assertion
   */
  producer: (manifest) => {
    const cwAssertion = manifest.assertions.get('stds.schema-org.CreativeWork');

    return cwAssertion
      ? parseCreativeWorkAssertion(cwAssertion).producer
      : undefined;
  },

  /**
   * Gets any social accounts included in the CreativeWork assertion
   */
  socialAccounts: (manifest) => {
    const cwAssertion = manifest.assertions.get('stds.schema-org.CreativeWork');

    return cwAssertion
      ? parseCreativeWorkAssertion(cwAssertion).socialAccounts
      : undefined;
  },

  /**
   * Acquisition thumbnail for this manifest
   */
  thumbnail: {
    get: (manifest) =>
      manifest.data.asset?.thumbnail
        ? createThumbnail(manifest.data.asset.thumbnail)
        : undefined,
    getSerializable: async (manifest, onDispose) => {
      if (!manifest.data.asset?.thumbnail) {
        return undefined;
      }

      const thumbnailUrl = createThumbnail(
        manifest.data.asset.thumbnail,
      )?.getUrl();

      if (thumbnailUrl?.dispose) {
        onDispose(thumbnailUrl.dispose);
      }

      return thumbnailUrl?.data.url;
    },
  },
});

export type DefaultResolvers = typeof defaultResolvers;

interface CreativeWorkAssertionData {
  producer: Author | undefined;
  socialAccounts: Author[];
}

function parseCreativeWorkAssertion(
  assertion: CreativeWorkAssertion,
): CreativeWorkAssertionData {
  const producer = assertion.data.author?.find((x) => !x.hasOwnProperty('@id'));

  const socialAccounts = assertion.data.author?.filter((x) =>
    x.hasOwnProperty('@id'),
  );

  return {
    producer,
    socialAccounts,
  };
}
