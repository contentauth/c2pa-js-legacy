/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2Ingredient, L2ManifestStore } from 'c2pa';
import { Badge } from './components/Thumbnail';

export function getBadgeFromManifestStore(
  manifestStore?: L2ManifestStore | null,
): Badge {
  if (!manifestStore) {
    return 'none';
  }

  switch (manifestStore.error) {
    case 'otgp':
      return 'missing';
    case 'error':
      return 'alert';
    default:
      return 'info';
  }
}

export function getBadgeFromIngredient(ingredient: L2Ingredient): Badge {
  if (!ingredient.hasManifest) {
    return 'none';
  }

  switch (ingredient.error) {
    case 'otgp':
      return 'missing';
    case 'error':
      return 'alert';
    default:
      return 'info';
  }
}
