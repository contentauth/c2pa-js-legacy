/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ConfigurablePanelSection } from '../../mixins/configurablePanelSection';
import { baseSectionStyles, defaultStyles } from '../../styles';
import defaultStringMap from './ContentSummary.str.json';

import '../../../assets/svg/monochrome/generic-info.svg';
import '../Icon';
import '../PanelSection';

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
export class ContentSummary extends ConfigurablePanelSection(LitElement, {
  dataSelector: (manifestStore) => manifestStore?.generativeInfo,
  config: defaultConfig,
}) {
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

  render() {
    return this.renderSection(html`<cai-panel-section
      header=${this._config.stringMap['content-summary.header']}
      helpText=${this._config.stringMap['content-summary.helpText']}
    >
      <div class="section-icon-content">
        <cai-icon-generic-info></cai-icon-generic-info>
        <span>
          ${this._config.stringMap['content-summary.content.aiGenerated']}
        </span>
      </div>
    </cai-panel-section>`);
  }
}
