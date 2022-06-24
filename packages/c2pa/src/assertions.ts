/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ManifestAssertion, Assertion } from '@contentauth/toolkit';

// Can be extended with module augmentation to allow consumers to define custom assertion types
export interface ExtendedAssertions {}

type ExtendedAssertionMap = {
  [label in keyof ExtendedAssertions]: Assertion<
    label,
    ExtendedAssertions[label]
  >;
};

type ExtendedAssertionUnion = ExtendedAssertionMap[keyof ExtendedAssertionMap];

type Assertions = ExtendedAssertionUnion | ManifestAssertion;

export interface AssertionAccessor {
  data: Assertion[];

  /**
   * Returns the first assertion matching the provided label, and null if no matches are found.
   *
   * @param label Assertion label
   */
  get: <T extends string>(
    label: Assertions['label'] | T,
    index?: number,
  ) =>
    | (T extends Assertions['label']
        ? Extract<Assertions, { label: T }>
        : Assertion)
    | null;

  /**
   * Returns a list of all assertions matching the provided label.
   *
   * @param label Assertion label
   */
  getAll: <T extends string>(
    label: T,
  ) => T extends Assertions['label']
    ? Extract<Assertions, { label: T }>[]
    : Assertion[];
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
      return (
        sortedAssertions.find((data) => data.label === label) ?? (null as any)
      );
    },

    getAll: (label) => {
      return sortedAssertions.filter((data) => data.label === label) as any;
    },
  };
}
