/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css } from 'lit';

export const defaultStyles = css`
  :host {
    --cai-font-size-base: 0.9375rem;
    --cai-font-size-lg: 1rem;
    --cai-font-size-md: 0.9375rem;
    --cai-font-size-sm: 0.875rem;
    --cai-border-radius: 4px;
    --cai-primary-color: #2c2c2c;
    --cai-secondary-color: #8e8e8e;
    --cai-popover-bg-color: #ffffff;
    --cai-popover-color: var(--cai-primary-color);

    font-family: var(--cai-font-family);
    font-size: var(--cai-font-size-base);
    color: var(--cai-primary-color);

    text-align: left;

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
  }
`;

export const baseSectionStyles = css`
  :host {
    display: block;
  }
`;
