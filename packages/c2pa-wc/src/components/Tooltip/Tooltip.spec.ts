/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { fixture, html } from '@open-wc/testing';
import './Tooltip';

describe('Tooltip', function () {
  it('renders text', async function () {
    const el = await fixture(html`<cai-tooltip>fooby dooby doo</cai-tooltip>`);
    expect(el.textContent).toContain('fooby dooby doo');
  });
});
