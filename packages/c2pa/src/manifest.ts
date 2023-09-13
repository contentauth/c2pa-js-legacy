/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import {
  Credential,
  SignatureInfo,
  Manifest as ToolkitManifest,
} from '@contentauth/toolkit';
import { AssertionAccessor, createAssertionAccessor } from './assertions';
import { Ingredient, createIngredient } from './ingredient';
import { ManifestMap } from './manifestStore';
import { Thumbnail, createThumbnail } from './thumbnail';

export interface Manifest {
  /**
   *  Human-readable title, generally source filename
   */
  title: string;

  /**
   * MIME type of the asset associated with this manifest
   */
  format: string;

  /**
   * Optional prefix added to the generated manifest label
   */
  vendor: string | null;

  /**
   * User Agent string identifying the software/hardware/system that created this manifest
   */
  claimGenerator: string;
  claimGeneratorHints: Record<string, unknown> | null;

  /**
   * Instance ID from `xmpMM:InstanceID` in XMP metadata.
   */
  instanceId: string;

  /**
   * Signature information (issuer, date) associated with this manifest
   */
  signatureInfo: SignatureInfo | null;

  /**
   * List of Verifiable Credentials
   */
  credentials: Credential[];

  /**
   * List of ingredients included within this manifest
   */
  ingredients: Ingredient[];

  /**
   * List of URIs referencing redacted assertions
   */
  redactions: string[];

  /**
   * The manifest this manifest is an ingredient of, if applicable
   */
  parent: Manifest | null;

  /**
   * Thumbnail accessor, if available
   */
  thumbnail: Thumbnail | null;

  /**
   * Interface providing access to assertions contained within this manifest
   */
  assertions: AssertionAccessor;
}

/**
 * Creates a facade object with convenience methods over manifest data returned from the toolkit.
 *
 * @param manifestData Raw manifest data returned by the toolkit
 * @param manifests A map of previously-created manifest objects to be provided to ingredients. Must contain any manifest referenced by this manifest's ingredients.
 */
export function createManifest(
  manifestData: ToolkitManifest,
  manifests: ManifestMap,
): Manifest {
  const ingredients = manifestData.ingredients.map((ingredientData) =>
    createIngredient(
      ingredientData,
      ingredientData.active_manifest
        ? manifests[ingredientData.active_manifest]
        : undefined,
    ),
  );

  return {
    title: manifestData.title,
    format: manifestData.format,
    vendor: manifestData.vendor ?? null,
    claimGenerator: manifestData.claim_generator,
    claimGeneratorHints: manifestData.claim_generator_hints ?? null,
    instanceId: manifestData.instance_id,
    signatureInfo: manifestData.signature_info ?? null,
    credentials: manifestData.credentials ?? [],
    ingredients,
    redactions: manifestData.redactions ?? [],
    parent: null,

    thumbnail: createThumbnail(manifestData.resources, manifestData.thumbnail),

    assertions: createAssertionAccessor(manifestData.assertions),
  };
}
