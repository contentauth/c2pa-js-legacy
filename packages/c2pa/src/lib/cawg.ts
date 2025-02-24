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
  verifiedIdentities: VerifiedIdentity[];
  credentialSchema: CredentialSchema[];
}

export interface CredentialSchema {
  id: string;
  type: string;
}

export interface VerifiedIdentity {
  type: string;
  username: string;
  uri: string;
  verifiedAt: string;
  provider: Provider;
}

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
    .map((report) => report.named_actor.verifiedIdentities)
    .flat();
}
