/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import type {
  ActionV1,
  Assertion,
  C2paActionsAssertion,
  ManifestAssertion,
} from '@contentauth/toolkit';
import type { Manifest } from '../manifest';

const genAiDigitalSourceTypes = [
  'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
  'https://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
  'http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia',
  'https://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia',
];

function formatGenAiDigitalSourceTypes(type: string) {
  return type.substring(type.lastIndexOf('/') + 1);
}

export type LegacyAssertion = Assertion<
  'com.adobe.generative-ai',
  {
    description: string;
    version: string;
    prompt?: string;
  }
>;

export type GenAiAssertion = ManifestAssertion | LegacyAssertion;

export interface GenerativeInfo {
  assertion: GenAiAssertion;
  action?: ActionV1;
  type:
    | 'legacy'
    | 'trainedAlgorithmicMedia'
    | 'compositeWithTrainedAlgorithmicMedia';
  softwareAgent: string;
}

/**
 * Gets any generative AI information from the manifest.
 *
 * @param manifest - Manifest to derive data from
 */
export function selectGenerativeInfo(
  manifest: Manifest,
): GenerativeInfo[] | null {
  const data = manifest.assertions.data.reduce<GenerativeInfo[]>(
    (acc, assertion: Assertion<any, any>) => {
      // Check for legacy assertion
      if (assertion.label === 'com.adobe.generative-ai') {
        const { description, version } = (assertion as LegacyAssertion).data;
        const softwareAgent = [description, version]
          .map((x) => x?.trim() ?? '')
          .join(' ');
        return [
          ...acc,
          {
            assertion,
            type: 'legacy',
            softwareAgent: softwareAgent,
          },
        ];
      }

      // Check for actions v1 assertion
      if (assertion.label === 'c2pa.actions') {
        const { actions } = (assertion as C2paActionsAssertion).data;
        const genAiActions: GenerativeInfo[] = actions.reduce<GenerativeInfo[]>(
          (actionAcc, action: ActionV1) => {
            const { digitalSourceType } = action;
            if (
              digitalSourceType &&
              genAiDigitalSourceTypes.includes(digitalSourceType)
            ) {
              actionAcc.push({
                assertion,
                action: action,
                type: formatGenAiDigitalSourceTypes(digitalSourceType),
                softwareAgent: action.softwareAgent,
              } as GenerativeInfo);
            }

            return actionAcc;
          },
          [],
        );

        return [...acc, ...genAiActions];
      }

      return acc;
    },
    [],
  );

  return data.length ? data : null;
}

/**
 * Returns a set of software agents
 * @param generativeInfo - generative info from manifest
 */
export function selectGenerativeSoftwareAgents(
  generativeInfo: GenerativeInfo[],
) {
  const softwareAgents = [
    ...new Set(
      generativeInfo.map((assertion) => {
        return assertion?.softwareAgent;
      }),
    ),
  ];
  //if there are undefined software agents remove them from the array

  return softwareAgents.filter((element) => typeof element !== 'undefined');
}

/**
 * Returns the generative type (trained , legacy or composite)
 * @param generativeInfo - generative info from manifest
 */

export function selectGenerativeType(generativeInfo: GenerativeInfo[]) {
  const result =
    // Try to see if we have any composite assertions
    generativeInfo.find(
      (assertion) => assertion.type === 'compositeWithTrainedAlgorithmicMedia',
      // If not, fall back to whichever one the first item is, which should be the trained or legacy assertion
    ) ?? generativeInfo[0];

  return result?.type ?? null;
}
