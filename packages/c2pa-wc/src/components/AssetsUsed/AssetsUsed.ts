/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { L2ManifestStore } from 'c2pa';
import defaultStringMap from './AssetsUsed.str.json';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { getBadgeFromIngredient } from '../../badge';
import { ConfigurablePanelSection } from '../../mixins/configurablePanelSection';

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
  stringMap: Record<string, string>;
}

const defaultConfig: AssetsUsedConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-assets-used')
export class AssetsUsed extends ConfigurablePanelSection(LitElement, {
  dataSelector: (manifestStore) => manifestStore.ingredients,
  isEmpty: (data) => !data.length,
  config: defaultConfig,
}) {
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
    return this.renderSection(html` <cai-panel-section
      header=${this._config.stringMap['assets-used.header']}
      helpText=${this._config.stringMap['assets-used.helpText']}
    >
      <div class="section-assets-used">
        ${this._data?.map(
          (ingredient) => html`
            <cai-thumbnail
              class="section-assets-used-thumbnail"
              src=${ingredient.thumbnail}
              badge=${getBadgeFromIngredient(ingredient)}
            ></cai-thumbnail>
          `,
        )}
      </div>
    </cai-panel-section>`);
  }
}
