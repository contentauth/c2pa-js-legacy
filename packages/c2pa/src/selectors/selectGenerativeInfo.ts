/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import type { Manifest } from '../manifest';

declare module '../assertions' {
  interface ExtendedAssertions {
    'com.adobe.generative-ai': {
      description: string;
      version: string;
      prompt?: string;
    };
  }
}

export interface GenerativeInfo {
  modelName: string;
  modelVersion: string;
  prompt?: string;
}

/**
 * Gets any generative AI information from the manifest.
 *
 * **Note:** The current setup is temporary and will be replaced/combined with a standardized
 * selector that is in the C2PA spec.
 *
 * @param manifest - Manifest to derive data from
 */
export function selectGenerativeInfo(
  manifest: Manifest,
): GenerativeInfo | null {
  const [genAiAssertion] = manifest.assertions.get('com.adobe.generative-ai');

  if (!genAiAssertion) {
    return null;
  }

  return {
    modelName: genAiAssertion.data.description,
    modelVersion: genAiAssertion.data.version,
    prompt: genAiAssertion.data.prompt,
  };
}
