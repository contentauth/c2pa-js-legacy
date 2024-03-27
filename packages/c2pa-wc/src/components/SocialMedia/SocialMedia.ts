/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2SocialAccount } from 'c2pa';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Configurable } from '../../mixins/configurable';
import { ifDefined } from 'lit/directives/if-defined.js';
import defaultStringMap from '../SocialMedia/SocialMedia.str.json';
import { baseSectionStyles, defaultStyles } from '../../styles';
import defaultStringMap from '../SocialMedia/SocialMedia.str.json';

import { hasChanged } from '../../utils';
import '../Icon';
import '../PanelSection';

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
export class SocialMedia extends Configurable(LitElement, defaultConfig) {
  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .section-social-media-list {
          --cai-icon-size: 16px;
          display: flex;
          flex-direction: row;
          list-style: none;
          padding: 0px 0px 0px 2px;
          margin: 0;
        }

        .section-social-media-list-item {
          display: flex;
          align-items: center;
        }

        .section-social-media-list-item-link {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `,
    ];
  }

  @property({
    type: Object,
    hasChanged,
  })
  data: L2SocialAccount[] | undefined;

  render() {
    return html`<cai-panel-section
      helpText=${this._config.stringMap['social-media.helpText']}
    >
      <div slot="header">${this._config.stringMap['social-media.header']}</div>
      <ul class="section-social-media-list" slot="content" aria-label=${this._config.stringMap['social-media.header']}>
        ${this.data?.map(
          (socialAccount) => html`
            <li class="section-social-media-list-item">
              <a
                class="section-social-media-list-item-link"
                href=${ifDefined(socialAccount['@id'] ?? undefined)}
                target="_blank"
              >
                <cai-icon source="${socialAccount['@id']}"></cai-icon>
              </a>
            </li>
          `,
        )}
      </ul>
    </cai-panel-section>`;
  }
}
