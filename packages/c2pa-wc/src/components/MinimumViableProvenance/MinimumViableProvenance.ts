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
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import defaultStringMap from './MinimumViableProvenance.str.json';
import { defaultDateFormatter } from '../../utils';
import { Configurable } from '../../mixins/configurable';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { getBadgeFromManifestStore } from '../../badge';

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
  stringMap: Record<string, string>;
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
  manifestStore: L2ManifestStore | undefined;

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
    const signatureDate = this.manifestStore?.signature?.isoDateString
      ? parseISO(this.manifestStore?.signature.isoDateString)
      : undefined;

    return html` <cai-panel-section
      header=${this._config.stringMap['minimum-viable-provenance.header']}
      helpText=${this._config.stringMap['minimum-viable-provenance.helpText']}
    >
      <div class="minimum-viable-provenance-content">
        <cai-thumbnail
          class="minimum-viable-provenance-thumbnail"
          src=${this.manifestStore?.thumbnail}
          badge=${getBadgeFromManifestStore(this.manifestStore)}
        ></cai-thumbnail>
        <div class="minimum-viable-provenance-signer">
          <cai-icon
            slot="icon"
            source=${this.manifestStore?.signature?.issuer}
          ></cai-icon>
          <span> ${this.manifestStore?.signature?.issuer} </span>
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
