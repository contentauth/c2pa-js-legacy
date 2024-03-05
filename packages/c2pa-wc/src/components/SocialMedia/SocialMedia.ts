/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import defaultStringMap from '../SocialMedia/SocialMedia.str.json';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { ConfigurablePanelSection } from '../../mixins/configurablePanelSection';

import '../PanelSection';
import '../Icon';

declare global {
  interface HTMLElementTagNameMap {
    'cai-social-media': SocialMedia;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-social-media': any;
    }
  }
}

export interface SocialMediaConfig {
  stringMap: Record<string, string>;
}

const defaultConfig: SocialMediaConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-social-media')
export class SocialMedia extends ConfigurablePanelSection(LitElement, {
  dataSelector: (manifestStore) => manifestStore?.socialAccounts,
  isEmpty: (data) => !data?.length,
  config: defaultConfig,
}) {
  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .section-social-media-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .section-social-media-list-item {
          display: flex;
          align-items: center;
        }

        .section-social-media-list-item-link {
          color: var(--cai-social-media-item-color, var(--cai-primary-color));
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `,
    ];
  }

  render() {
    return this.renderSection(html`<cai-panel-section
      header=${this._config.stringMap['social-media.header']}
      helpText=${this._config.stringMap['social-media.helpText']}
    >
      <ul
        class="section-social-media-list"
        aria-label=${this._config.stringMap['social-media.header']}
      >
        ${this._data?.map(
          (socialAccount) => html`
            <li class="section-social-media-list-item">
              <cai-icon
                source=${ifDefined(socialAccount['@id'] ?? undefined)}
              ></cai-icon>
              <a
                class="section-social-media-list-item-link"
                href=${ifDefined(socialAccount['@id'] ?? undefined)}
                target="_blank"
              >
                @${socialAccount.name}
              </a>
            </li>
          `,
        )}
      </ul>
    </cai-panel-section>`);
  }
}
