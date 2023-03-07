/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

declare module '@contentauth/detector/pkg/detector_bg.wasm';

declare module '*.svg' {
  const content: string;
  export default content;
}
