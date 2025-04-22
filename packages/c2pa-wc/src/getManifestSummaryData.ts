/**
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import {
  isHandmade,
  Manifest,
  ManifestStore,
  selectDoNotTrain,
  selectFormattedGenerator,
  selectGenerativeInfo,
  selectProducer,
  selectSocialAccounts,
} from 'c2pa';

export interface ManifestSummaryStore {
  recorder: string | null;
  name: string | null;
  nameVerifier: NameVerifier | null;
  socialAccounts: SocialAccount[];
  contentSummaryTag: ContentSummaryTag | null;
  unrecordedChanges: boolean;
  doNotTrain: boolean;
  error: boolean;
}

interface NameVerifier {
  name: string;
  profileUrl: string | null;
}

interface SocialAccount {
  provider: string;
  url: string | null;
  username: string;
  verified: boolean;
}

export type ContentSummaryTag =
  | 'ai'
  | 'no-ai'
  | 'camera-captured'
  | 'more-info';

export function getManifestSummaryData(
  manifestStore: ManifestStore,
): ManifestSummaryStore {
  const { activeManifest } = manifestStore;

  const recorder = selectFormattedGenerator(activeManifest);
  const { name, nameVerifier } = getNameAndVerifier(activeManifest);
  const contentSummaryTag = getContentSummaryTag(manifestStore);
  const { unrecordedChanges, error } = getErrorStatus(manifestStore);

  return {
    recorder,
    name,
    nameVerifier,
    socialAccounts: getSocialAccounts(activeManifest),
    contentSummaryTag,
    unrecordedChanges,
    doNotTrain: selectDoNotTrain(activeManifest),
    error,
  };
}

function getSocialAccounts(manifest: Manifest): SocialAccount[] {
  const cwSocialAccounts: SocialAccount[] =
    selectSocialAccounts(manifest)?.map((socialAccount) => ({
      provider: socialAccount['@id'] ?? '',
      url: socialAccount['@id'] ?? null,
      username: socialAccount.name,
      verified: false,
    })) ?? [];

  const verifiedSocialAccounts: SocialAccount[] = manifest.verifiedIdentities
    .filter((identity) => identity.type === 'cawg.social_media')
    .map((identity) => ({
      provider: identity.provider.id,
      url: identity.uri,
      username: identity.username,
      verified: true,
    }));

  const socialAccounts: SocialAccount[] = verifiedSocialAccounts.length
    ? verifiedSocialAccounts
    : cwSocialAccounts;

  return socialAccounts;
}

function getNameAndVerifier(
  manifest: Manifest,
): Pick<ManifestSummaryStore, 'name' | 'nameVerifier'> {
  const cwName = selectProducer(manifest)?.name ?? null;

  const verifiedName = manifest.verifiedIdentities.find(
    (identity) => identity.type === 'cawg.document_verification',
  );

  if (verifiedName) {
    return {
      name: verifiedName.name,
      nameVerifier: {
        name: verifiedName.provider.name,
        profileUrl: verifiedName.uri ?? null,
      },
    };
  }

  return {
    name: cwName,
    nameVerifier: null,
  };
}

function getContentSummaryTag(
  manifestStore: ManifestStore,
): ContentSummaryTag | null {
  if (
    Object.values(manifestStore.manifests).some((manifest) =>
      selectGenerativeInfo(manifest),
    )
  ) {
    return 'ai';
  }

  if (false) {
    // TODO: add camera-captured
    return 'camera-captured';
  }

  if (isHandmade(manifestStore)) {
    return 'no-ai';
  }

  if (false) {
    // TODO: add more-info
    return 'more-info';
  }

  return null;
}

function getErrorStatus(
  manifestStore: ManifestStore,
): Pick<ManifestSummaryStore, 'unrecordedChanges' | 'error'> {
  const otgpStatus = manifestStore.validationStatus.some(
    (status) => status.code === 'assertion.dataHash.mismatch',
  );
  const otherErrors = manifestStore.validationStatus.filter(
    (status) => status.code !== 'assertion.dataHash.mismatch',
  );

  return {
    unrecordedChanges: otgpStatus,
    error: otherErrors.length > 0,
  };
}
