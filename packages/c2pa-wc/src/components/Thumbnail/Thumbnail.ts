/**
 * Copyright 2021 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { nothing } from 'lit-html';
import { defaultStyles } from '../../styles';
import { classPartMap } from '../../utils';

import '../Tooltip';

import '../../../assets/svg/monochrome/broken-image.svg';
import '../../../assets/svg/color/info.svg';
import '../../../assets/svg/color/alert.svg';
import '../../../assets/svg/color/missing.svg';

declare global {
  interface HTMLElementTagNameMap {
    'cai-thumbnail': Thumbnail;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-thumbnail': any;
    }
  }
}

export type Badge = 'none' | 'info' | 'missing' | 'alert';

@customElement('cai-thumbnail')
export class Thumbnail extends LitElement {
  static readonly badgeMap: Record<Badge, TemplateResult | typeof nothing> = {
    none: nothing,
    info: html`<cai-icon-info class="badge-icon"></cai-icon-info>`,
    missing: html`<cai-icon-missing class="badge-icon"></cai-icon-missing>`,
    alert: html`<cai-icon-alert class="badge-icon"></cai-icon-alert>`,
  };

  /**
   * Image source - if set to undefined/null it will show a broken image icon
   */
  @property({ type: String })
  src = undefined;

  /**
   * A badge to show, if desired
   */
  @property({ type: String })
  badge: Badge = 'none';

  /**
   * True if the thumbnail is selected
   */
  @property({ type: Boolean })
  selected = false;

  /**
   * Help text to be displayed when a user hovers over the badge
   */
  @property({
    type: String,
    attribute: 'badge-help-text',
  })
  badgeHelpText = undefined;

  static get styles() {
    return [
      defaultStyles,
      css`
        :host {
          display: inline-block;
          width: var(--cai-thumbnail-size, 72px);
          height: var(--cai-thumbnail-size, 72px);
        }
        .container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          border-radius: var(--cai-thumbnail-border-radius, 3px);
          transition: box-shadow 200ms ease-in-out;
          box-shadow: 0 0 0 0 transparent;
        }
        .selected {
          box-shadow: var(--cai-thumbnail-selected-shadow-offset-x, 0)
            var(--cai-thumbnail-selected-shadow-offset-y, 0)
            var(--cai-thumbnail-selected-shadow-blur, 0)
            var(--cai-thumbnail-selected-shadow-spread, 3px)
            var(--cai-thumbnail-selected-shadow-color, #1473e6);
        }
        cai-tooltip.badge-tooltip,
        .badge-no-tooltip {
          --cai-popover-icon-border-radius: 50% 50% 0 50%;
          position: absolute;
          top: var(--cai-thumbnail-badge-icon-top, 1px);
          right: var(--cai-thumbnail-badge-icon-right, 1px);
          left: var(--cai-thumbnail-badge-icon-left, auto);
          bottom: var(--cai-thumbnail-badge-icon-bottom, auto);
          width: var(--cai-thumbnail-badge-icon-width, 20px);
          height: var(--cai-thumbnail-badge-icon-height, 20px);
        }
        cai-tooltip.badge-tooltip {
          pointer-events: auto;
        }
        .badge-icon {
          --cai-icon-width: var(--cai-thumbnail-badge-icon-width, 20px);
          --cai-icon-height: var(--cai-thumbnail-badge-icon-height, 20px);
        }
        .included-badge {
          display: flex;
        }
        .no-image {
          --cai-icon-width: var(
            --cai-thumbnail-no-image-icon-width,
            var(--cai-icon-width, 20px)
          );
          --cai-icon-width: var(
            --cai-thumbnail-no-image-icon-height,
            var(--cai-icon-height, 20px)
          );
          --cai-icon-fill: var(
            --cai-thumbnail-no-image-icon-fill,
            var(--cai-icon-width, #8e8e8e)
          );
        }
      `,
    ];
  }

  render() {
    const containerClasses = classPartMap({
      container: true,
      selected: this.selected,
    });

    return html`<style>
        .container {
          background: url(${this.src}) var(--cai-thumbnail-bgcolor, #eaeaea);
        }
      </style>
      <div class=${containerClasses}>
        <slot name="badge">
          ${this.badge !== 'none' && this.badgeHelpText
            ? html`<cai-tooltip class="badge-tooltip">
                <div slot="content">${this.badgeHelpText}</div>
                <div class="included-badge" slot="trigger">
                  ${Thumbnail.badgeMap[this.badge]}
                </div>
              </cai-tooltip>`
            : html`<div class="badge-no-tooltip">
                ${Thumbnail.badgeMap[this.badge]}
              </div>`}
        </slot>
        ${!this.src
          ? html`<div class="no-image">
              <cai-icon-broken-image></cai-icon-broken-image>
            </div>`
          : nothing}
      </div>`;
  }
}
