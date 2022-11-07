/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2Manifest } from 'c2pa';
import { isValid, parseISO } from 'date-fns';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import defaultStringMap from './MinimumViableProvenance.str.json';
import { defaultDateFormatter } from '../../utils';
import { Configurable } from '../../mixins/configurable';
import { baseSectionStyles, defaultStyles } from '../../styles';

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
  stringMap: Partial<typeof defaultStringMap>;
  dateFormatter: (date: Date) => string;
}

const defaultConfig: MinimumViableProvenanceConfig = {
  stringMap: defaultStringMap,
  dateFormatter: defaultDateFormatter,
};

@customElement('cai-minimum-viable-provenance')
export class MinimumViableProvenance extends Configurable(
  LitElement,
  defaultConfig,
) {
  @property({
    type: Object,
  })
  manifest: L2Manifest | undefined;

  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
      .minimum-viable-provenance-content {
        --cai-thumbnail-size: 48px;
        display: grid;
        grid-template-columns: 48px auto;
        grid-gap: 2px 10px;
        text-align: left;
      }
      .minimum-viable-provenance-thumbnail {
        grid-column: 1;
        grid-row: 1 / 3;
      }
      .minimum-viable-provenance-signer {
        grid-column: 2;
        grid-row: 1;
        align-self: flex-end;
        display: grid;
        grid-template-columns: min-content max-content;
        align-items: center;
      }
      .minimum-viable-provenance-date {
        grid-column: 2;
        grid-row: 2;
        color: var(--cai-secondary-color, #6e6e6e);
      `,
    ];
  }

  render() {
    const signatureDate = this.manifest?.signature?.isoDateString
      ? parseISO(this.manifest?.signature.isoDateString)
      : undefined;

    return html` <cai-panel-section
      header=${this._config.stringMap['minimum-viable-provenance.header']}
      helpText=${this._config.stringMap['minimum-viable-provenance.helpText']}
    >
      <div class="minimum-viable-provenance-content">
        <cai-thumbnail
          class="minimum-viable-provenance-thumbnail"
          src=${this.manifest?.thumbnail}
          badge="none"
        ></cai-thumbnail>
        <div class="minimum-viable-provenance-signer">
          <cai-icon
            slot="icon"
            source=${this.manifest?.signature?.issuer}
          ></cai-icon>
          <span> ${this.manifest?.signature?.issuer} </span>
        </div>
        <div class="minimum-viable-provenance-date">
          ${isValid(signatureDate)
            ? html`${this._config?.dateFormatter(signatureDate!)}`
            : html`${this._config?.stringMap[
                'minimum-viable-provenance.invalidDate'
              ]}`}
        </div>
      </div>
    </cai-panel-section>`;
  }
}
