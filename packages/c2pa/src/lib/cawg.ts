/**
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

export type CawgReport = Record<string, CawgManifestReport[]>;

export interface CawgManifestReport {
  sig_type: string;
  referenced_assertions: string[];
  named_actor: NamedActor;
}

export interface NamedActor {
  '@context': string[];
  type: string[];
  issuer: string;
  validFrom: Date;
  verifiedIdentities?: VerifiedIdentity[];
  credentialSchema: CredentialSchema[];
}

export interface CredentialSchema {
  id: string;
  type: string;
}

interface VerifiedIdentityBase {
  verifiedAt: string;
  provider: Provider;
}

interface VerifiedIdentitySocial extends VerifiedIdentityBase {
  type: 'cawg.social_media';
  username: string;
  uri: string;
}

interface VerifiedIdentityName extends VerifiedIdentityBase {
  type: 'cawg.document_verification';
  name: string;
  profileUrl?: string;
}

export type VerifiedIdentity = VerifiedIdentitySocial | VerifiedIdentityName;

export interface Provider {
  id: string;
  name: string;
}

export function deserializeCawgString(cawgString: string): CawgReport {
  return JSON.parse(cawgString);
}

export function getVerifiedIdentitiesFromCawgManifestReports(
  cawgManifestReports: CawgManifestReport[],
): VerifiedIdentity[] {
  return cawgManifestReports
    .map((report) => report.named_actor?.verifiedIdentities ?? [])
    .flat();
}
