/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../../assets/svg/monochrome/generic-info.svg';
import { Configurable } from '../../mixins/configurable';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { hasChanged } from '../../utils';
import '../Icon';
import '../PanelSection';
import defaultStringMap from './ContentSummary.str.json';

declare global {
  interface HTMLElementTagNameMap {
    'cai-content-summary': ContentSummary;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-content-summary': any;
    }
  }
}

export interface ContentSummaryConfig {
  stringMap: Record<string, string>;
}

const defaultConfig: ContentSummaryConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-content-summary')
export class ContentSummary extends Configurable(LitElement, defaultConfig) {
  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .section-process-content {
          display: flex;
          align-items: center;
        }
        .section-icon-content {
          display: flex;
          align-items: flex-start;
          gap: var(--cai-icon-spacing, 8px);
        }
      `,
    ];
  }

  @property({
    type: Object,
    hasChanged,
  })
  data: string | undefined;

  render() {
    return html`<cai-panel-section
      helpText=${this._config.stringMap['content-summary.helpText']}
    >
      <div class="section-icon-content" slot="content">
        ${this.data === 'compositeWithTrainedAlgorithmicMedia'
          ? html`
              <span>
                ${this._config.stringMap['content-summary.content.composite']}
              </span>
            `
          : html`
              <span>
                ${this._config.stringMap['content-summary.content.aiGenerated']}
              </span>
            `}
      </div>
    </cai-panel-section>`;
  }
}
