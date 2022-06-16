/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { animate } from '@lit-labs/motion';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import '../../assets/svg/monochrome/help.svg';
import { importParts } from '../directives/ExportParts';
import { defaultStyles } from '../styles';
import { Popover } from './Popover';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cai-tooltip': any;
    }
  }
}

@customElement('cai-tooltip')
export class Tooltip extends LitElement {
  static readonly popoverPrefix = 'tooltip';

  static readonly cssParts = {
    ...importParts(Popover.cssParts, Tooltip.popoverPrefix),
  };

  @state()
  protected _isShown = false;

  @property({ type: Number })
  animationDuration = 200;

  static get styles() {
    return [
      defaultStyles,
      css`
        .container {
          position: relative;
        }
        .trigger {
          --cai-icon-width: var(--cai-popover-icon-width, 16px);
          --cai-icon-height: var(--cai-popover-icon-height, 16px);
          --cai-icon-fill: var(--cai-popover-icon-fill, #a8a8a8);
          cursor: pointer;
        }
        .content {
          position: absolute;
          opacity: 0;
          top: 0;
          right: calc(var(--cai-popover-icon-width, 16px) + 10px);
          min-width: 185px;
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

  private _showTooltip() {
    this._isShown = true;
  }

  private _hideTooltip() {
    this._isShown = false;
  }

  render() {
    const contentClassMap = {
      content: true,
      shown: this._isShown,
    };

    return html`
      <div class="container">
        <div
          class="trigger"
          slot="trigger"
          @mouseenter="${this._showTooltip}"
          @mouseleave="${this._hideTooltip}"
        >
          <slot name="trigger">
            <cai-icon-help></cai-icon-help>
          </slot>
        </div>
        <div
          class=${classMap(contentClassMap)}
          slot="content"
          ${animate({
            keyframeOptions: {
              duration: this.animationDuration,
            },
            onStart: (anim) => {
              if (anim.element.classList.contains('shown')) {
                anim.element.classList.remove('hidden');
              }
            },
            onComplete: (anim) => {
              if (!anim.element.classList.contains('shown')) {
                anim.element.classList.add('hidden');
              }
            },
          })}
        >
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }
}
