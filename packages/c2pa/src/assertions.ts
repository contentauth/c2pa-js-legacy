/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Assertion, ManifestAssertion } from '@contentauth/toolkit/types';

export interface ExtendedAssertions {}

type MappedExtendedAssertions = {
  [Label in keyof ExtendedAssertions]: Assertion<
    Label,
    ExtendedAssertions[Label]
  >;
};

type AllAssertions =
  | MappedExtendedAssertions[keyof MappedExtendedAssertions]
  | ManifestAssertion;

export interface AssertionAccessor {
  data: Assertion[];
  get: <T extends AllAssertions['label']>(
    label: T,
  ) => (Extract<AllAssertions, { label: T }> | undefined)[];
}

/**
 * Creates a facade object with convenience methods over assertion data returned from the toolkit.
 *
 * @param assertionData Raw assertion data returned by the toolkit
 */
export function createAssertionAccessor(
  assertionData: Assertion[],
): AssertionAccessor {
  const sortedAssertions = assertionData.sort(
    (a, b) => (a?.instance ?? 0) - (b?.instance ?? 0),
  );

  return {
    data: sortedAssertions,

    get: (label) => {
      // @TODO: can the "any" cast be avoided?
      return sortedAssertions.filter((data) => data.label === label) as any;
    },
  };
}
