/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import {
  L2ManifestStore,
  selectGenerativeSoftwareAgents,
  selectGenerativeType,
} from 'c2pa';
import { LitElement, css, html, nothing } from 'lit';
import { classMap } from 'lit-html/directives/class-map.js';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref, type Ref } from 'lit/directives/ref.js';
import { Configurable } from '../../mixins/configurable';
import { defaultStyles } from '../../styles';
import { defaultDateFormatter, hasChanged } from '../../utils';
import type { MinimumViableProvenanceConfig } from '../MinimumViableProvenance';
import { Localizable } from '../../mixins/localizable';

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

const defaultConfig: MinimumViableProvenanceConfig = {
  dateFormatter: defaultDateFormatter,
};

@customElement('cai-manifest-summary')
export class ManifestSummary extends Configurable(
  Localizable(LitElement),
  defaultConfig,
) {
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
        #content-container> *::(first-child) {
          padding-top: 0;
          margin-top: 0;
          border: none;
        }
        #content-container > *:not(:first-child):not([empty]) {
          padding-top: var(--cai-manifest-summary-content-padding, 12px);
          margin-top: var(--cai-manifest-summary-section-spacing, 12px);
          border-top-width: var(
            --cai-manifest-summary-section-border-width,
            1px
          );
          border-top-style: var(
            --cai-manifest-summary-section-border-style,
            solid
          );
          border-top-color: var(
            --cai-manifest-summary-section-border-color,
            #e1e1e1
          );
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

        .empty {
          display: none;
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

  private _postRef: Ref<HTMLSlotElement> = createRef();

  @state()
  private _isPostEmpty = false;

  private _checkPostEmpty() {
    const refVal = this._postRef.value;
    if (refVal) {
      this._isPostEmpty = refVal.assignedNodes({ flatten: true }).length === 0;
    }
  }

  firstUpdated(): void {
    this._checkPostEmpty();
  }

  render() {
    if (!this.manifestStore) {
      return null;
    }

    const aiToolUsed = this.manifestStore?.generativeInfo
      ? selectGenerativeSoftwareAgents(this.manifestStore?.generativeInfo)
      : null;

    const dataSelectors = {
      contentSummary: this.manifestStore?.generativeInfo
        ? selectGenerativeType(this.manifestStore?.generativeInfo)
        : null,
      producedBy: this.manifestStore?.producer?.name,
      producedWith: this.manifestStore?.claimGenerator,
      socialMedia: this.manifestStore?.socialAccounts,
      aiToolUsed: aiToolUsed?.length ? aiToolUsed : null,
      web3: this.manifestStore?.web3,
    };

    return html`<div id="container">
      <cai-minimum-viable-provenance
        .manifestStore=${this.manifestStore}
        .config=${this._config}
        locale=${this.locale}
      ></cai-minimum-viable-provenance>
      <div id="content-container">
        ${this.manifestStore.error === 'error'
          ? html` <div>${this.strings['manifest-summary.error']}</div> `
          : html`
              ${dataSelectors.contentSummary
                ? html`
                    <cai-content-summary
                      .data=${dataSelectors.contentSummary}
                      .config=${this._config}
                      locale=${this.locale}
                    ></cai-content-summary>
                  `
                : nothing}
              ${dataSelectors.producedBy
                ? html`
                    <cai-produced-by
                      .data=${dataSelectors.producedBy}
                      .config=${this._config}
                      locale=${this.locale}
                    ></cai-produced-by>
                  `
                : nothing}
              ${dataSelectors.producedWith
                ? html`
                    <cai-produced-with
                      .data=${dataSelectors.producedWith}
                      .manifestStore=${this.manifestStore}
                      .config=${this._config}
                      locale=${this.locale}
                    ></cai-produced-with>
                  `
                : nothing}
              ${dataSelectors.socialMedia?.length
                ? html`
                    <cai-social-media
                      .data=${dataSelectors.socialMedia}
                      .config=${this._config}
                      locale=${this.locale}
                    ></cai-social-media>
                  `
                : nothing}
              ${dataSelectors.aiToolUsed
                ? html`
                    <cai-ai-tool
                      .data=${dataSelectors.aiToolUsed}
                      locale=${this.locale}
                    ></cai-ai-tool>
                  `
                : nothing}
              ${dataSelectors.web3
                ? html`
                    <cai-web3
                      .data=${dataSelectors.web3}
                      .config=${this._config}
                      locale=${this.locale}
                    ></cai-web3>
                  `
                : nothing}
            `}
        <slot
          ${ref(this._postRef)}
          class=${classMap({ empty: this._isPostEmpty })}
          name="post"
          @slotchange=${() => this._checkPostEmpty()}
        ></slot>
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
                ${this.strings['manifest-summary.viewMore']}
              </a>
            `
          : nothing}
      </div>
    </div>`;
  }
}
