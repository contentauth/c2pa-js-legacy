/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import type { Manifest } from '../manifest';

export function selectFormattedGenerator(manifest: Manifest) {
  const value = manifest.claimGenerator;
  // We are stripping parenthesis so that any version matches in there don't influence the test
  const withoutParens = value.replace(/\([^)]*\)/g, '');
  if (/\s+\d+\.\d(\.\d)*\s+/.test(withoutParens)) {
    // Old-style (XMP Agent) string (match space + version)
    return value.split('(')[0]?.trim();
  } else {
    // User-Agent string
    // Split by space (the RFC uses the space as a separator)
    const firstItem = withoutParens.split(/\s+/)?.[0] ?? '';
    // Parse product name from version
    // Adobe_Photoshop/23.3.1 -> [Adobe_Photoshop, 23.3.1]
    const [product, version] = firstItem.split('/');
    // Replace underscores with spaces
    // Adobe_Photoshop -> Adobe Photoshop
    const formattedProduct = product.replace(/_/g, ' ');
    if (version) {
      return `${formattedProduct} ${version}`;
    }
    return formattedProduct;
  }
}
