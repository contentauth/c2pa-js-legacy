/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */
import {
  Metadata,
  Ingredient as ToolkitIngredient,
  ValidationStatus,
} from '@contentauth/toolkit';
import { Manifest } from './manifest';
import { Thumbnail, createThumbnail } from './thumbnail';

export interface Ingredient {
  /**
   * Human-readable title, generally source filename
   */
  title: string;

  /**
   * MIME type of the asset associated with this ingredient
   */
  format: string;

  /**
   * Document ID from `xmpMM:DocumentID` in XMP metadata
   */
  documentId: string | null;

  /**
   * Instance ID from `xmpMM:InstanceID` in XMP metadata
   */
  instanceId: string;

  /**
   * URI from `dcterms:provenance` in XMP metadata
   */
  provenance: string | null;

  /**
   * Optional hash of the asset to prevent duplicates
   */
  hash: string | null;

  /**
   * `true` if this ingredient has a 'parentOf' relationship, i.e. it is the parent ingredient of its manifest
   */
  isParent: boolean;

  /**
   * Validation errors associated with this ingredient
   */
  validationStatus: ValidationStatus[];

  /**
   * The manifest contained within this ingredient, if applicable
   */
  manifest: Manifest | null;

  /**
   * Thumbnail accessor, if available
   */
  thumbnail: Thumbnail | null;

  /**
   * Additional metadata as defined by the C2PA spec
   */
  metadata: Metadata | null;
}

/**
 * Creates a facade object with convenience methods over ingredient data returned from the toolkit.
 *
 * @param ingredientData Raw ingredient data returned by the toolkit
 * @param manifest If provided, the created ingredient will link to this manifest. This should be the manifest with a label matching this ingredient's manifestId field.
 */
export function createIngredient(
  ingredientData: ToolkitIngredient,
  manifest?: Manifest,
): Ingredient {
  return {
    title: ingredientData.title,
    format: ingredientData.format,
    documentId: ingredientData.document_id ?? null,
    instanceId: ingredientData.instance_id,
    provenance: ingredientData.provenance ?? null,
    hash: ingredientData.hash ?? null,
    isParent: ingredientData.relationship === 'parentOf',
    validationStatus: ingredientData.validation_status ?? [],
    metadata: ingredientData.metadata ?? null,
    manifest: manifest ?? null,

    thumbnail: createThumbnail(
      ingredientData.resources,
      ingredientData.thumbnail,
    ),
  };
}
