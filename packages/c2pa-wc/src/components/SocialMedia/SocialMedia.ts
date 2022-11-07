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
import defaultStringMap from '../SocialMedia/SocialMedia.str.json';
import { baseSectionStyles, defaultStyles } from '../../styles';

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
  stringMap: typeof defaultStringMap;
}

const defaultConfig: SocialMediaConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-social-media')
export class SocialMedia extends Configurable(LitElement, defaultConfig) {
  @property({
    type: Object,
  })
  manifest: L2Manifest | undefined;

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
          overflow: hidden;
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
    return this.manifest?.socialAccounts?.length
      ? html`<cai-panel-section
          header=${defaultConfig.stringMap['social-media.header']}
          helpText=${defaultConfig.stringMap['social-media.helpText']}
        >
          <ul class="section-social-media-list">
            ${this.manifest.socialAccounts?.map(
              (socialAccount) => html`
                <li class="section-social-media-list-item">
                  <cai-icon source="${socialAccount['@id']}"></cai-icon>
                  <a
                    class="section-social-media-list-item-link"
                    href=${socialAccount['@id']}
                    target="_blank"
                  >
                    @${socialAccount.name}
                  </a>
                </li>
              `,
            )}
          </ul>
        </cai-panel-section>`
      : nothing;
  }
}
