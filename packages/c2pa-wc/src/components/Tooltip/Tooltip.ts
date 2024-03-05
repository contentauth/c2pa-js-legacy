/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { autoPlacement } from '@floating-ui/dom';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../../assets/svg/monochrome/help.svg';
import { defaultStyles } from '../../styles';
import { Configurable } from '../../mixins/configurable';
import defaultStringMap from './Tooltip.str.json';

import '../Icon';
import '../Popover';

declare global {
  interface HTMLElementTagNameMap {
    'cai-tooltip': Tooltip;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-tooltip': any;
    }
  }
}

export interface TooltipConfig {
  stringMap: Record<string, string>;
}

const defaultConfig: TooltipConfig = {
  stringMap: defaultStringMap,
};

@customElement('cai-tooltip')
export class Tooltip extends Configurable(LitElement, defaultConfig) {
  @state()
  protected _isShown = false;

  @property({ type: Number })
  animationDuration = 200;

  @property({ type: Object })
  autoPlacement: Parameters<typeof autoPlacement>[0] = { padding: 10 };

  @property({ type: Boolean })
  arrow = true;

  @property({ type: String })
  label?: string;

  static get styles() {
    return [
      defaultStyles,
      css`
        #trigger {
          display: flex;
          --cai-icon-width: var(--cai-popover-icon-width, 16px);
          --cai-icon-height: var(--cai-popover-icon-height, 16px);
          --cai-icon-border-radius: var(--cai-popover-icon-border-radius, 50%);
          --cai-icon-fill: var(--cai-popover-icon-fill, #909090);
          cursor: pointer;
          height: var(--cai-icon-height);
          width: var(--cai-icon-width);
          line-height: 0;
          border-radius: var(--cai-icon-border-radius);
          outline-color: var(--cai-focus-ring-color);
          outline-offset: 1px;
        }
        .content {
          min-width: 165px;
          max-width: 235px;
          font-size: 13px;
          padding: 10px;
          box-shadow: none;
          border-radius: var(--cai-border-radius);
          background-color: #fff;
          filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.4));
          z-index: 10;
          pointer-events: none;
        }
        .content.shown {
          opacity: 1;
        }
        .content.hidden {
          display: none;
        }
      `,
    ];
  }

  render() {
    const contentClassMap = {
      content: true,
      shown: this._isShown,
    };

    return html`
      <cai-popover
        id="popover"
        ?arrow=${this.arrow}
        .autoPlacement=${this.autoPlacement}
        ?interactive=${false}
      >
        <div
          id="trigger"
          slot="trigger"
          role="button"
          tabindex="0"
          aria-label=${ifDefined(this.label ?? undefined)}
          aria-labelledby=${`${this.label ? 'trigger' : ''} icon`}
          aria-describedby="tooltip"
        >
          <slot name="trigger">
            <cai-icon-help
              id="icon"
              role="img"
              aria-label=${this._config.stringMap['tooltip.information']}
            ></cai-icon-help>
          </slot>
        </div>
        <div
          class=${classMap(contentClassMap)}
          slot="content"
          role="tooltip"
          id="tooltip"
        >
          <slot name="content"></slot>
        </div>
      </cai-popover>
    `;
  }
}
