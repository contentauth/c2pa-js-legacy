// Copyright 2022 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

export interface ResourceStore {
  resources: Record<string, number[]>;
}

export interface ResourceParent {
  resources: ResourceStore;
}

export interface ResourceReference {
  format: string;
  identifier: string;
}

export interface ManifestStore {
  active_manifest: string;
  manifests: Record<string, Manifest>;
  validation_status?: ValidationStatus[];
}

export interface ValidationStatus {
  code: string;
  url?: string;
  explanation?: string;
}

export interface HashedUri {
  url: string;
  alg?: string;
  hash: number[];
}

export interface Ingredient extends ResourceParent {
  title: string;
  format: string;
  document_id?: string;
  instance_id: string;
  provenance?: string;
  thumbnail: ResourceReference;
  hash?: string;
  is_parent?: boolean;
  active_manifest?: string;
  validation_status?: ValidationStatus[];
  metadata?: Metadata;
}

export interface SignatureInfo {
  issuer?: string;
  time?: string;
  cert_serial_number?: string;
}

export interface ClaimGeneratorInfo {
  name: string;
  version: string;
  icon?: ResourceReference;
}

export interface Manifest extends ResourceParent {
  vendor?: string;
  claim_generator: string;
  claim_generator_hints?: Record<string, unknown>;
  claim_generator_info?: ClaimGeneratorInfo[];
  title: string;
  format: string;
  instance_id: string;
  thumbnail: ResourceReference;
  ingredients: Ingredient[];
  credentials?: Credential[];
  assertions: Assertion[];
  redactions?: string[];
  label?: string;
  signature_info?: SignatureInfo;
}

type ManifestAssertionKind = 'Cbor' | 'Json' | 'Binary' | 'Uri';

export type AssertionData<U = unknown> = {
  metadata?: Metadata;
} & U;

export interface Assertion<T = string, U = unknown> {
  label: T;
  data: AssertionData<U>;
  instance?: number;
  kind?: ManifestAssertionKind;
}

export type C2paActionsAssertion = Assertion<
  'c2pa.actions',
  {
    actions: ActionV1[];
  }
>;

export type C2paActionsAssertionV2 = Assertion<
  'c2pa.actions.v2',
  {
    actions: ActionV2[];
  }
>;

export type C2paHashDataAssertion = Assertion<
  'c2pa.hash.data',
  {
    exclusions: Exclusion[];
    name: string;
    alg: string;
    hash: Uint8Array;
    pad: Uint8Array;
  }
>;

export type CreativeWorkAssertion = Assertion<
  'stds.schema-org.CreativeWork',
  {
    '@context': string;
    '@type': string;
    author: Author[];
    url?: string;
  }
>;

export type Web3Assertion = Assertion<
  'adobe.crypto.addresses',
  {
    ethereum?: string[];
    solana?: string[];
  }
>;

export type ManifestAssertion =
  | C2paActionsAssertion
  | C2paActionsAssertionV2
  | C2paHashDataAssertion
  | CreativeWorkAssertion
  | Web3Assertion;

export interface ActionV2 {
  action: string;
  softwareAgent?: GeneratorInfoMap;
  description?: string;
  digitalSourceType?: string;
  when?: string;
  changes?: Change[];
  actors?: Actor[];
  related?: ActionV2[];
  reason?: string;
  parameters?: ParametersV2;
}
interface ParametersV2 {
  ingredient?: HashedUri;
  description?: string;
  [key: string]: any;
}

interface Change {
  [key: string]: any;
}

export interface GeneratorInfoMap {
  name: string;
  version: string;
  [key: string]: any;
}

export interface ActionV1 {
  action: string;
  softwareAgent?: string;
  changed?: string[];
  instanceId?: string;
  parameters?: Parameters;
  digitalSourceType?: string;
}

export interface Parameters {
  name: string;
}

export interface Exclusion {
  start: number;
  length: number;
}

export interface Author {
  '@type': string;
  name: string;
  identifier: string;
  credential?: HashedUri[];
  '@id'?: string;
  [key: string]: any;
}

export interface Credential {
  '@context': string[];
  credentialSubject: CredentialSubject;
  id: string;
  proof: Proof;
  type: string[];
}

export interface CredentialSubject {
  id: string;
  name: string;
}

export interface Proof {
  created: string;
  proof_purpose: string;
  proof_type: string;
  proof_value: string;
  verification_method: string;
}

export interface Metadata {
  reviewRatings?: ReviewRating[];
  dateTime?: string;
  reference?: HashedUri;
  dataSource?: DataSource;
  [key: string]: unknown;
}

export interface ReviewRating {
  value: 1 | 2 | 3 | 4 | 5;
  code?: ReviewCode;
  explanation: string;
}

export type ReviewCode =
  | 'actions.unknownActionsPerformed'
  | 'actions.missing'
  | 'actions.possiblyMissing'
  | 'depthMap.sceneMismatch'
  | 'ingredient.modified'
  | 'ingredient.possiblyModified'
  | 'thumbnail.primaryMismatch'
  | 'stds.iptc.location.inaccurate'
  | 'stds.schema-org.CreativeWork.misattributed'
  | 'stds.schema-org.CreativeWork.missingAttribution';

export interface DataSource {
  type: SourceType;
  details?: string;
  actors?: Actor[];
}

export type SourceType =
  | 'signer'
  | 'claimGenerator.REE'
  | 'claimGenerator.TEE'
  | 'localProvider.REE'
  | 'localProvider.TEE'
  | 'remoteProvider.1stParty'
  | 'remoteProvider.3rdParty'
  | 'humanEntry.anonymous'
  | 'humanEntry.identified';

export interface Actor {
  identifier?: string;
  credentials?: HashedUri[];
}

/**
 * Errors
 */

export interface ToolkitError extends Error {
  url?: string;
}
