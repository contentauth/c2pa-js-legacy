/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2ClaimGenerator, L2ManifestStore } from 'c2pa';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { Localizable } from '../../mixins/localizable';

import { hasChanged } from '../../utils';
import '../Icon';
import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-produced-with': ProducedWith;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-produced-with': any;
    }
  }
}

export interface ProducedWithConfig {
  stringMap: Record<string, string>;
}

@customElement('cai-produced-with')
export class ProducedWith extends Localizable(LitElement) {
  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .section-produced-with-content {
          display: flex;
          align-items: center;
        }

        .section-produced-with-beta {
          color: var(--cai-secondary-color);
        }
      `,
    ];
  }

  @property({
    type: Object,
    hasChanged,
  })
  data: L2ClaimGenerator | undefined;

  @property({
    type: Object,
    hasChanged,
  })
  manifestStore: L2ManifestStore | undefined;

  render() {
    return html` <cai-panel-section
      helpText=${this.strings['produced-with.helpText']}
    >
      <div slot="header">${this.strings['produced-with.header']}</div>
      <div slot="content">
        <div class="section-produced-with-content">
          <span> ${this.data?.product ?? ''}    
          ${
            this.manifestStore?.isBeta
              ? html`<span class="section-produced-with-beta">
                  ${this.strings['produced-with.beta']}
                </span>`
              : null
          } </span>
        </div>
      <div>
    </cai-panel-section>`;
  }
}
