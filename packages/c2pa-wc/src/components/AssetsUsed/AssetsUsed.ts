/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement, nothing } from 'lit';
import { Configurable } from '../../mixins/configurable';
import { customElement, property } from 'lit/decorators.js';
import { L2Manifest } from 'c2pa';
import defaultStringMap from './AssetsUsed.str.json';
import { baseSectionStyles, defaultStyles } from '../../styles';

import '../Thumbnail';
import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-assets-used': AssetsUsed;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-assets-used': any;
    }
  }
}

export interface AssetsUsedConfig {
  stringMap: typeof defaultStringMap;
}

const defaultConfig: AssetsUsedConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-assets-used')
export class AssetsUsed extends Configurable(LitElement, defaultConfig) {
  @property({
    type: Object,
  })
  manifest: L2Manifest | undefined;

  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .section-assets-used {
          --cai-thumbnail-size: 48px;
          display: grid;
          color: blue;
          grid-template-columns: repeat(
            auto-fill,
            var(--cai-thumbnail-size, 48px)
          );
          grid-gap: 10px;
          text-align: left;
        }
      `,
    ];
  }

  render() {
    return this.manifest?.ingredients.length
      ? html` <cai-panel-section
          header=${this._config.stringMap['assets-used.header']}
          helpText=${this._config.stringMap['assets-used.helpText']}
        >
          <div class="section-assets-used">
            ${this.manifest.ingredients?.map(
              (ingredient) => html`
                <cai-thumbnail
                  class="section-assets-used-thumbnail"
                  src=${ingredient.thumbnail}
                  badge="none"
                ></cai-thumbnail>
              `,
            )}
          </div>
        </cai-panel-section>`
      : nothing;
  }
}
