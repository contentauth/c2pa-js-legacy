/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseSectionStyles, defaultStyles } from '../../styles';

import '../Tooltip';

declare global {
  interface HTMLElementTagNameMap {
    'cai-header-section': PanelSection;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-header-section': any;
    }
  }
}

@customElement('cai-header-section')
export class PanelSection extends LitElement {
  @property({ type: String })
  header = '';

  @property({ type: String })
  helpText: string | null = null;

  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        div.layout {
          display: grid;
          grid-template-columns: auto;
          grid-template-rows: auto;
          gap: var(--cai-panel-section-internal-spacing, 0.5rem);
        }
        div.heading {
          display: flex;
          align-items: center;
        }
        div.heading-text {
          color: var(
            --cai-panel-section-heading-color,
            var(--cai-primary-color)
          );

          font-weight: var(--cai-panel-section-heading-font-weight, bold);
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="layout">
        <div class="heading">
          <div class="heading-text">${this.header}</div>
        </div>
        <slot></slot>
      </div>
    `;
  }
}
