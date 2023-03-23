/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { defaultStyles } from '../../styles';
import { defaultDateFormatter, hasChanged } from '../../utils';
import { L2ManifestStore } from 'c2pa';
import type { EditsAndActivityConfig } from '../EditsAndActivity';
import type { MinimumViableProvenanceConfig } from '../MinimumViableProvenance';
import { Configurable } from '../../mixins/configurable';
import defaultStringMap from './ManifestSummary.str.json';

import '../AssetsUsed';
import '../ProducedBy';
import '../ProducedWith';
import '../SocialMedia';
import '../EditsAndActivity';
import '../MinimumViableProvenance';

declare global {
  interface HTMLElementTagNameMap {
    'cai-manifest-summary': ManifestSummary;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-manifest-summary': any;
    }
  }
}

export interface ManifestSummaryConfig
  extends Pick<MinimumViableProvenanceConfig, 'dateFormatter'>,
    Pick<EditsAndActivityConfig, 'showDescriptions'> {
  stringMap: Record<string, string>;
  sections?: {
    assetsUsed?: boolean;
    editsAndActivity?: boolean;
    producedBy?: boolean;
    producedWith?: boolean;
    socialMedia?: boolean;
  };
}

const defaultConfig: ManifestSummaryConfig = {
  stringMap: defaultStringMap,
  dateFormatter: defaultDateFormatter,
  showDescriptions: true,
  sections: {
    assetsUsed: true,
    editsAndActivity: true,
    producedBy: true,
    producedWith: true,
    socialMedia: true,
  },
};

@customElement('cai-manifest-summary')
export class ManifestSummary extends Configurable(LitElement, defaultConfig) {
  static readonly cssParts = {
    viewMore: 'manifest-summary-view-more',
  };

  static get styles() {
    return [
      defaultStyles,
      css`
        #container {
          width: var(--cai-manifest-summary-width, 320px);
        }

        #content-container {
          padding: var(--cai-manifest-summary-content-padding, 20px);
          max-height: var(--cai-manifest-summary-content-max-height, 550px);
          border-bottom-width: var(
            --cai-manifest-summary-content-border-bottom-width,
            1px
          );
          border-bottom-style: var(
            --cai-manifest-summary-content-border-bottom-style,
            solid
          );
          border-bottom-color: var(
            --cai-manifest-summary-content-border-bottom-color,
            #e1e1e1
          );

          overflow-y: auto;
          overflow-x: hidden;
        }

        #content-container > *:not(:first-child):not([empty]),
        ::slotted(*) {
          padding-top: var(--cai-manifest-summary-section-spacing, 20px);
          margin-top: var(--cai-manifest-summary-section-spacing, 20px);
          border-top-width: var(
            --cai-manifest-summary-section-border-width,
            1px
          ) !important;
          border-top-style: var(
            --cai-manifest-summary-section-border-style,
            solid
          ) !important;
          border-top-color: var(
            --cai-manifest-summary-section-border-color,
            #e1e1e1
          ) !important;
        }

        #view-more-container {
          padding: var(--cai-manifest-summary-view-more-padding, 20px);
        }

        #view-more {
          display: block;
          transition: all 150ms ease-in-out;
          background-color: transparent;
          border-radius: 9999px;
          border: 2px solid #b3b3b3;
          padding: 8px 0;
          font-weight: bold;
          text-align: center;
          text-decoration: none;
          width: 100%;
          color: var(--cai-primary-color);
        }

        #view-more:hover {
          background-color: #eeeeee;
        }
      `,
    ];
  }

  @property({
    type: Object,
    hasChanged,
  })
  manifestStore: L2ManifestStore | undefined;

  @property({
    type: String,
    attribute: 'view-more-url',
  })
  viewMoreUrl = '';

  render() {
    if (!this.manifestStore) {
      return null;
    }

    return html`<div id="container">
      <div id="content-container">
        <cai-minimum-viable-provenance
          .manifestStore=${this.manifestStore}
          .config=${this._config}
        ></cai-minimum-viable-provenance>
        <slot name="pre"></slot>
        ${this.manifestStore.error === 'error'
          ? html`
              <div>${this._config.stringMap['manifest-summary.error']}</div>
            `
          : html`
              ${this._config?.sections?.producedBy
                ? html`
                    <cai-produced-by
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-produced-by>
                  `
                : nothing}
              ${this._config?.sections?.producedWith
                ? html`
                    <cai-produced-with
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-produced-with>
                  `
                : nothing}
              ${this._config?.sections?.editsAndActivity
                ? html`
                    <cai-edits-and-activity
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-edits-and-activity>
                  `
                : nothing}
              ${this._config?.sections?.assetsUsed
                ? html`
                    <cai-assets-used
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-assets-used>
                  `
                : nothing}
              ${this._config?.sections?.socialMedia
                ? html`
                    <cai-social-media
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-social-media>
                  `
                : nothing}
            `}
        <slot></slot>
        <slot name="post"></slot>
      </div>
      <div id="view-more-container">
        ${this.viewMoreUrl
          ? html`
              <a
                id="view-more"
                part=${ManifestSummary.cssParts.viewMore}
                href=${this.viewMoreUrl}
                target="_blank"
              >
                ${this._config.stringMap['manifest-summary.viewMore']}
              </a>
            `
          : nothing}
      </div>
    </div>`;
  }
}
