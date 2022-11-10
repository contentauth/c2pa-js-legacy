/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ValidationStatus } from "@contentauth/toolkit";

export const OTGP_ERROR_CODE = 'assertion.dataHash.mismatch';

/**
 * Determines if a validation status list contains an OTGP (`assertion.dataHash.mismatch`)
 * status
 *
 * @param validationStatus
 * @returns `true` if we find an OTGP status
 */
export function hasOtgpStatus(validationStatus: ValidationStatus[] = []) {
  return validationStatus.some((err) => err.code === OTGP_ERROR_CODE);
}

/**
 * Determines if a validation status list contains an error (anything not in the c2pa-rs
 * `C2PA_STATUS_VALID_SET` list _and_ not an OTGP status)
 * 
 * @param validationStatus
 * @returns `true` if we find an error
 */
export function hasErrorStatus(validationStatus: any[] = []) {
  return validationStatus.length > 0 && !hasOtgpStatus(validationStatus) 
}
