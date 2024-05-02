/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2ManifestStore } from 'c2pa';
import { isValid, parseISO } from 'date-fns';
import { LitElement, css, html, nothing } from 'lit';
import { classMap } from 'lit-html/directives/class-map.js';
import { customElement, property } from 'lit/decorators.js';
import { Configurable } from '../../mixins/configurable';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { defaultDateFormatter } from '../../utils';
import { Localizable } from '../../mixins/localizable';

import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-minimum-viable-provenance': MinimumViableProvenance;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-minimum-viable-provenance': any;
    }
  }
}

export interface MinimumViableProvenanceConfig {
  dateFormatter: (date: Date) => string;
}

const defaultConfig: MinimumViableProvenanceConfig = {
  dateFormatter: defaultDateFormatter,
};

@customElement('cai-minimum-viable-provenance')
export class MinimumViableProvenance extends Configurable(
  Localizable(LitElement),
  defaultConfig,
) {
  @property({
    type: Object,
  })
  manifestStore: L2ManifestStore | undefined;

  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .minimum-viable-provenance-content {
          display: flex;
          text-align: left;
          color: #666666;
        }
        div.container {
          padding: var(
            --cai-manifest-summary-content-padding,
            12px 16px 12px 16px
          );
        }
        .minimum-viable-provenance-signer.no-date {
          height: 100%;
        }
        div.heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        div.heading-text {
          color: var(
            --cai-panel-section-heading-color,
            var(--cai-primary-color)
          );
          font-size: 18px;
          font-weight: var(--cai-panel-section-heading-font-weight, bold);
        }
      `,
    ];
  }

  render() {
    const hasError = this.manifestStore?.error === 'error';

    const mvpClasses = {
      'minimum-viable-provenance-signer': true,
      'no-date': hasError,
    };

    const signatureDate = this.manifestStore?.signature?.isoDateString
      ? parseISO(this.manifestStore?.signature.isoDateString)
      : undefined;

    return html`
      <div class="container">
        <div class="heading">
          <div class="heading-text" role="heading" aria-level="2">
            ${this.strings['minimum-viable-provenance.header']}
          </div>
        </div>
        <div class="minimum-viable-provenance-content">
          <div class=${classMap(mvpClasses)}>
            <span>
              ${this.strings['minimum-viable-provenance.issuedBy']}
              ${this.manifestStore?.signature?.issuer}
              ${!hasError
                ? html`
                    ${signatureDate && isValid(signatureDate)
                      ? html`${this.strings['minimum-viable-provenance.on']}
                        ${this._config?.dateFormatter(signatureDate!)}`
                      : nothing}
                  `
                : nothing}
            </span>
          </div>
        </div>
      </div>
    `;
  }
}
