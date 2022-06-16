import { fixture, html } from '@open-wc/testing';
import '../dist';

describe('Tooltip', function () {
  it('renders text', async function () {
    const el = await fixture(html`<cai-tooltip>fooby dooby doo</cai-tooltip>`);
    expect(el.textContent).toContain('fooby dooby doo');
  });
});
