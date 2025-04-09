/**
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { hasChanged } from '../../utils';
import '../../../assets/svg/monochrome/verified.svg';
import '../../../assets/svg/monochrome/inspect.svg';
import '../../../assets/svg/monochrome/alert-notice.svg';

import '../Icon';
import {
  ContentSummaryTag,
  ManifestSummaryStore,
} from '../../getManifestSummaryData';
import { Localizable } from '../../mixins/localizable';

declare global {
  interface HTMLElementTagNameMap {
    'cai-manifest-summary-v2': ManifestSummaryV2;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-manifest-summary-v2': any;
    }
  }
}

@customElement('cai-manifest-summary-v2')
export class ManifestSummaryV2 extends Localizable(LitElement) {
  static styles = [
    css`
      :host {
        display: inline-block;
        font-family: 'Adobe Clean', sans-serif;
        --cai-icon-size: 20px;
      }

      .header {
        font-size: 22px;
        font-weight: 900;
        line-height: 28px;
        color: #222222;
      }

      .subheader {
        font-size: 14px;
        font-weight: 400;
        line-height: 21px;
        color: #222222;
      }

      .container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
      }

      .header-container {
        display: flex;
        flex-direction: column;
      }

      .error-container {
        display: flex;
        flex-direction: row;
        gap: 10px;
        background-color: #f8f8f8;
        border-radius: 4px;
        padding: 6px 10px;
      }

      .error-icon {
        flex-shrink: 0;
        transform: translate(0, 2px);
      }

      .error-text {
        font-size: 14px;
        font-weight: 400;
        line-height: 21px;
        color: #222222;
      }

      .divider {
        height: 1px;
        background-color: #e6e6e6;
      }

      .content-label {
        font-size: 14px;
        font-weight: 700;
        line-height: 21px;
        color: #222222;
      }

      .content-row {
        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
      }

      .social-container {
        display: grid;
        grid-template-columns: 20px 1fr;
        row-gap: 16px;
        column-gap: 10px;
        align-items: center;
      }

      .name-verifier {
        color: #222222;
        font-weight: 400;
        font-size: 14px;
      }

      .verified-icon-container {
        margin-inline-start: auto;
        background-color: transparent;
        border-radius: 4px;
        display: flex;
        padding: 2px;
        position: relative;
        --cai-icon-width: 20px;
        --cai-icon-height: 20px;
        transition: background-color 0.13s linear;
      }

      .verified-icon-label {
        opacity: 0;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        background-color: #222222;
        color: #ffffff;
        border-radius: 4px;
        padding: 2px 4px;
        position: absolute;
        right: 0;
        top: 26px;
        white-space: nowrap;
        transition: opacity 0.13s linear;
      }

      .verified-icon-container.tooltip-visible {
        background-color: #e6e6e6;
      }

      .verified-icon-container.tooltip-visible > .verified-icon-label {
        opacity: 1;
      }

      .link {
        color: #5258e4;
        text-decoration: none;
        font-size: 14px;
        font-weight: 700;
        line-height: 21px;
      }

      .inspect-container {
        display: flex;
        justify-content: flex-end;
      }

      .inspect-link {
        text-decoration: none;
        border: 2px solid #222222;
        border-radius: 9999px;
        color: #222222;
        font-size: 14px;
        font-weight: 700;
        padding: 6px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: background-color 0.13s linear;
        line-height: 18px;
      }

      .inspect-link:hover {
        background-color: rgba(0, 0, 0, 0.15);
      }
    `,
  ];

  @property({ type: Object, hasChanged })
  manifestStore: ManifestSummaryStore | undefined;

  @property({
    type: String,
    attribute: 'inspect-url',
  })
  inspectUrl: string | undefined = undefined;

  @state()
  protected tooltipVisible = false;

  showTooltip() {
    this.tooltipVisible = true;
  }

  hideTooltip() {
    this.tooltipVisible = false;
  }

  handleTouchStart() {
    this.showTooltip();
    setTimeout(() => {
      this.hideTooltip();
    }, 5000);
  }

  render() {
    if (!this.manifestStore) {
      return nothing;
    }

    const providerNameToDisplayString: Record<string, string> = {
      LINKEDIN: 'LinkedIn',
    };

    const recorder = this.manifestStore.recorder;
    const name = this.manifestStore.name;
    const nameVerifier = this.manifestStore.nameVerifier
      ? providerNameToDisplayString[this.manifestStore.nameVerifier.name]
      : null;
    const nameVerifierProfileUrl = this.manifestStore.nameVerifier
      ? this.manifestStore.nameVerifier.profileUrl
      : null;
    const socialAccounts = this.manifestStore.socialAccounts;
    const unrecorded = this.manifestStore.unrecordedChanges;
    const error = this.manifestStore.error;

    const inspectUrl = this.inspectUrl;

    const contentSummaryMap: Record<ContentSummaryTag, string> = {
      ai: this.strings['manifest-summary-v2.ai'],
      'no-ai': this.strings['manifest-summary-v2.no-ai'],
      'camera-captured': this.strings['manifest-summary-v2.camera-captured'],
      'more-info': this.strings['manifest-summary-v2.more-info'],
    };

    const contentSummary = this.manifestStore.contentSummaryTag
      ? contentSummaryMap[this.manifestStore.contentSummaryTag]
      : null;

    return html`
      <div class="container">
        <div class="header-container">
          <span class="header">Content Credentials</span>
          ${!error
            ? html`<span class="subheader"
                >${contentSummary ? `${contentSummary} • ` : ''}${this.strings[
                  'manifest-summary-v2.recordedBy'
                ]}
                ${recorder}</span
              >`
            : nothing}
        </div>
        ${error
          ? html` <div class="error-container">
              <cai-icon-alert-notice class="error-icon"></cai-icon-alert-notice>
              <span class="error-text"
                >${this.strings['manifest-summary-v2.error']}</span
              >
            </div>`
          : html`
              ${unrecorded
                ? html`
                    <div class="error-container">
                      <cai-icon-alert-notice
                        class="error-icon"
                      ></cai-icon-alert-notice>
                      <span class="error-text"
                        >${this.strings[
                          'manifest-summary-v2.unrecordedChanges'
                        ]}</span
                      >
                    </div>
                  `
                : nothing}
              ${name
                ? html`
                    <div class="divider"></div>
                    <div>
                      <div class="content-row">
                        <span class="content-label"
                          >${this.strings['manifest-summary-v2.name']}</span
                        >
                        ${nameVerifierProfileUrl
                          ? html`
                              <a
                                class="link"
                                href="${nameVerifierProfileUrl}"
                                rel="noopener"
                                target="_blank"
                                >${name}</a
                              >
                            `
                          : html` <span class="name-verifier">${name}</span> `}
                        ${nameVerifier
                          ? html`
                              <div
                                tabindex="0"
                                role="tooltip"
                                class="verified-icon-container ${this
                                  .tooltipVisible
                                  ? 'tooltip-visible'
                                  : ''}"
                                @mouseenter=${this.showTooltip}
                                @mouseleave=${this.hideTooltip}
                                @focus=${this.showTooltip}
                                @blur=${this.hideTooltip}
                                @touchstart=${this.handleTouchStart}
                              >
                                <cai-icon-verified></cai-icon-verified>
                                <div class="verified-icon-label">
                                  ${this.strings[
                                    'manifest-summary-v2.verifiedBy'
                                  ]}
                                  ${nameVerifier}
                                </div>
                              </div>
                            `
                          : nothing}
                      </div>
                    </div>
                  `
                : nothing}
              ${socialAccounts?.length
                ? html`
                    <div class="divider"></div>
                    <div class="social-container">
                      ${socialAccounts.map(
                        (account) => html`
                          <cai-icon source="${account.provider}"></cai-icon>
                          <a
                            class="link"
                            href="${account.url}"
                            rel="noopener"
                            target="_blank"
                            >${account.username}</a
                          >
                        `,
                      )}
                    </div>
                  `
                : nothing}
            `}
        ${inspectUrl
          ? html`
              <div class="inspect-container">
                <a
                  class="inspect-link"
                  href="${inspectUrl}"
                  target="_blank"
                  rel="noopener"
                >
                  ${this.strings[
                    'manifest-summary-v2.inspect'
                  ]}<cai-icon-inspect></cai-icon-inspect>
                </a>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
