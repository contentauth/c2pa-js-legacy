/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseSectionStyles, defaultStyles } from '../../styles';
import { Localizable } from '../../mixins/localizable';

import { hasChanged } from '../../utils';
import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-produced-by': ProducedBy;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-produced-by': any;
    }
  }
}

@customElement('cai-produced-by')
export class ProducedBy extends Localizable(LitElement) {
  static get styles() {
    return [defaultStyles, baseSectionStyles];
  }

  @property({
    type: Object,
    hasChanged,
  })
  data: string | undefined;

  render() {
    return html` <cai-panel-section
      helpText=${this.strings['produced-by.helpText']}
    >
      <div slot="header">${this.strings['produced-by.header']}</div>
      <div slot="content">${this.data}</div>
    </cai-panel-section>`;
  }
}
