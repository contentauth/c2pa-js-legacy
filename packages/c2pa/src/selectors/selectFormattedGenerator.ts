/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import type { Manifest } from '../manifest';

/**
 * Parses a generator string into a human-readable format
 *
 * @param value The claim generator/software agent string
 * @returns The formatted generator string
 */
export function parseGenerator(value: string) {
  // We are stripping parenthesis so that any version matches in there don't influence the test
  let withoutParens = '';
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') {
      depth++;
    } else if (value[i] === ')') {
      depth--;
    } else if (depth === 0) {
      withoutParens += value[i];
    }
  }

  // Old-style (XMP Agent) string (match space + version)
  if (/\s+\d+\.\d(\.\d)*\s+/.test(withoutParens)) {
    return value.split('(')[0]?.trim();
  }

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

export function selectFormattedGenerator(manifest: Manifest) {
  const claimGeneratorInfoName = manifest.claimGeneratorInfo.find(
    (val) => val?.name,
  )?.name;
  return (
    claimGeneratorInfoName ??
    (manifest.claimGenerator !== null
      ? parseGenerator(manifest.claimGenerator)
      : null)
  );
}
