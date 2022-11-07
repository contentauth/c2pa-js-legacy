/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2Manifest } from 'c2pa';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Configurable } from '../../mixins/configurable';
import defaultStringMap from './ProducedWith.str.json';
import { baseSectionStyles, defaultStyles } from '../../styles';

import '../PanelSection';
import '../Icon';

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
  stringMap: typeof defaultStringMap;
}

const defaultConfig: ProducedWithConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-produced-with')
export class ProducedWith extends Configurable(LitElement, defaultConfig) {
  @property({
    type: Object,
  })
  manifest: L2Manifest | undefined;

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
          margin-left: 24px;
          color: var(--cai-secondary-color);
        }
      `,
    ];
  }

  render() {
    return this.manifest?.claimGenerator
      ? html` <cai-panel-section
          header=${this._config.stringMap['produced-with.header']}
          helpText=${this._config.stringMap['produced-with.helpText']}
        >
          <div>
            <div class="section-produced-with-content">
              <cai-icon
                source="${this.manifest.claimGenerator.product}"
              ></cai-icon>
              <span> ${this.manifest.claimGenerator.product} </span>
            </div>
            ${this.manifest.isBeta
              ? html`<div class="section-produced-with-beta">
                  ${this._config.stringMap['produced-with.beta']}
                </div>`
              : null}
          </div>
        </cai-panel-section>`
      : nothing;
  }
}
