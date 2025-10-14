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

export type NamedActor = IcaNamedActor | CoseNamedActor;

export interface IcaNamedActor {
  '@context': string[];
  type: string[];
  issuer: string;
  validFrom: Date;
  verifiedIdentities?: VerifiedIdentity[];
  credentialSchema: CredentialSchema[];
}

export interface CoseNamedActor {
  signature_info: SignatureInfo;
  signer_payload: Record<string, unknown>; // TODO: fill out later if needed
}

export interface SignatureInfo {
  alg: string;
  cert_serial_number: string;
  issuer: string;
  revocation_status: string;
}

export interface CredentialSchema {
  id: string;
  type: string;
}

interface VerifiedIdentityBase {
  verifiedAt: string;
  provider: Provider;
  uri: string;
}

interface VerifiedIdentitySocial extends VerifiedIdentityBase {
  type: 'cawg.social_media';
  username: string;
}

interface VerifiedIdentityName extends VerifiedIdentityBase {
  type: 'cawg.document_verification';
  name: string;
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
    .map((report) =>
      !isCoseNamedActor(report.named_actor)
        ? report.named_actor?.verifiedIdentities ?? []
        : [],
    )
    .flat();
}

export function getIssuersFromCawgManifestReports(
  cawgManifestReports: CawgManifestReport[],
): string[] {
  return cawgManifestReports
    .map((report) =>
      isCoseNamedActor(report.named_actor)
        ? report.named_actor?.signature_info?.issuer ?? []
        : [],
    )
    .flat();
}

function isCoseNamedActor(
  namedActor: NamedActor,
): namedActor is CoseNamedActor {
  return 'signature_info' in namedActor;
}
