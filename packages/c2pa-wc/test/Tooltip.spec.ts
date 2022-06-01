import { fixture, html } from '@open-wc/testing';
import '../dist';

describe('Tooltip', function () {
  it('renders text', async function () {
    const el = await fixture(html`<cai-tooltip>fooby dooby doo</cai-tooltip>`);
    expect(el.textContent).toContain('fooby dooby doo');
  });

  it('correctly sets its exportparts attribute', async function () {
    const el = await fixture(html`<cai-tooltip>fooby dooby doo</cai-tooltip>`);

    const exportParts = el.shadowRoot
      ?.getElementById('popover')
      ?.getAttribute('exportparts')
      ?.split(',');

    expect(exportParts).toEqual(
      jasmine.arrayContaining([
        'tooltip-popover-arrow',
        'tooltip-popover-box',
        'tooltip-popover-content',
      ]),
    );
  });
});
