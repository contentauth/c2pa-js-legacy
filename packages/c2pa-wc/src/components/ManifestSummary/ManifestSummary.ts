/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2ManifestStore } from 'c2pa';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Configurable } from '../../mixins/configurable';
import { defaultStyles } from '../../styles';
import { defaultDateFormatter, hasChanged } from '../../utils';
import type { MinimumViableProvenanceConfig } from '../MinimumViableProvenance';
import defaultStringMap from './ManifestSummary.str.json';

import '../AIToolUsed';
import '../ContentSummary';
import '../MinimumViableProvenance';
import '../ProducedBy';
import '../ProducedWith';
import '../SocialMedia';
import '../Web3';

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

export interface ManifestSummaryConfig extends MinimumViableProvenanceConfig {
  stringMap: Record<string, string>;
  sections?: {
    producedBy?: boolean;
    producedWith?: boolean;
    socialMedia?: boolean;
    contentSummary?: boolean;
    aiToolUsed?: boolean;
    web3?: boolean;
  };
}

const defaultConfig: ManifestSummaryConfig = {
  stringMap: defaultStringMap,
  dateFormatter: defaultDateFormatter,

  sections: {
    producedBy: true,
    producedWith: true,
    socialMedia: true,
    contentSummary: true,
    aiToolUsed: true,
    web3: true,
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
          width: var(--cai-manifest-summary-width, 256px);
          border-radius: 8px;
        }

        #content-container {
          padding: var(
            --cai-manifest-summary-content-padding,
            12px 16px 12px 16px
          );
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

          border-top-width: var(
            --cai-manifest-summary-content-border-bottom-width,
            1px
          );
          border-top-style: var(
            --cai-manifest-summary-content-border-bottom-style,
            solid
          );
          border-top-color: var(
            --cai-manifest-summary-content-border-bottom-color,
            #e1e1e1
          );

          overflow-y: auto;
          overflow-x: hidden;
        }

        #content-container:first-child {
          border-bottom-width: var(
            --cai-manifest-summary-content-border-bottom-width,
            1px
          ) !important;
          border-bottom-style: var(
            --cai-manifest-summary-content-border-bottom-style,
            solid
          ) !important;
          border-bottom-color: var(
            --cai-manifest-summary-content-border-bottom-color,
            #e1e1e1
          ) !important;
        }

        #content-container > *:not([empty]):not(:last-child:empty),
        ::slotted(*) {
          padding-bottom: var(--cai-manifest-summary-content-padding, 12px);
          margin-bottom: var(--cai-manifest-summary-section-spacing, 12px);

          border-bottom-width: var(
            --cai-manifest-summary-section-border-width,
            1px
          ) !important;
          border-bottom-style: var(
            --cai-manifest-summary-section-border-style,
            solid
          ) !important;
          border-bottom-color: var(
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
          border: 2px solid var(--cai-button-color);
          padding: 8px 0;
          font-weight: bold;
          text-align: center;
          text-decoration: none;
          width: 100%;
          color: var(--cai-primary-color);
          background-color: var(--cai-button-color);
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
      <cai-minimum-viable-provenance
        .manifestStore=${this.manifestStore}
        .config=${this._config}
      ></cai-minimum-viable-provenance>
      <div id="content-container">
        <slot name="pre"></slot>
        ${this.manifestStore.error === 'error'
          ? html`
              <div>${this._config.stringMap['manifest-summary.error']}</div>
            `
          : html`
              ${this._config?.sections?.contentSummary
                ? html`
                    <cai-content-summary
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-content-summary>
                  `
                : nothing}
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
              ${this._config?.sections?.socialMedia
                ? html`
                    <cai-social-media
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-social-media>
                  `
                : nothing}
              ${this._config?.sections?.aiToolUsed
                ? html`
                    <cai-ai-tool
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-ai-tool>
                  `
                : nothing}
              ${this._config?.sections?.web3
                ? html`
                    <cai-web3
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                    ></cai-web3>
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
