/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import {
  arrow,
  autoPlacement,
  autoUpdate,
  computePosition,
  ComputePositionConfig,
  flip,
  inline,
  offset,
  Placement,
  shift,
  Strategy,
} from '@floating-ui/dom';
import { animate } from '@lit-labs/motion';
import { css, html, LitElement, PropertyValueMap } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import '../../../assets/svg/monochrome/help.svg';
import { defaultStyles } from '../../styles';

declare global {
  interface HTMLElementTagNameMap {
    'cai-popover': Popover;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-popover': any;
    }
  }
}

@customElement('cai-popover')
export class Popover extends LitElement {
  private _updateCleanupFn: Function | null = null;

  private _eventCleanupFns: Function[] = [];

  private positionConfig: Partial<ComputePositionConfig> = {};

  @state()
  protected _isShown = false;

  @property({ type: Number })
  animationDuration = 200;

  @property({ type: String })
  placement: Placement = 'left';

  @property({ type: String })
  strategy: Strategy = 'absolute';

  // No arguments generally passed except for the arrow element, which we do in the component
  @property({ type: Boolean })
  arrow = false;

  @property({ type: Object })
  flip: Parameters<typeof flip>[0] = undefined;

  @property({ type: Object })
  autoPlacement: Parameters<typeof autoPlacement>[0] = undefined;

  @property({ type: Object })
  offset: Parameters<typeof offset>[0] = { mainAxis: 6 };

  @property({ type: Object })
  shift: Parameters<typeof shift>[0] = {};

  // No arguments generally passed
  @property({ type: Boolean })
  inline = false;

  @property({ type: Boolean })
  interactive = false;

  @property({ type: Boolean })
  tab = false;

  @property({ type: String })
  trigger: string = 'mouseenter:mouseleave focus:blur';

  @property({ type: Number })
  zIndex = 10;

  @query('#arrow')
  arrowElement: HTMLElement | undefined;

  @query('#content')
  contentElement: HTMLElement | undefined;

  @query('#element')
  hostElement: HTMLElement | undefined;

  @query('#trigger')
  triggerElement: HTMLElement | undefined;

  // @TODO: respect updated properties
  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    const middleware: ComputePositionConfig['middleware'] = [];

    // The order here is important - please reference the floating-ui docs
    // Also remember that `{}` is truthy, any disabled-by-default options should be set to `undefined`
    if (this.inline) {
      middleware.push(inline());
    }
    // Note that autoPlacement cannot be used with flip
    if (this.flip && !this.autoPlacement) {
      middleware.push(flip(this.flip));
    }
    if (this.offset) {
      middleware.push(offset(this.offset));
    }
    if (this.shift) {
      middleware.push(shift(this.shift));
    }
    if (this.autoPlacement) {
      middleware.push(autoPlacement(this.autoPlacement));
    }
    if (this.arrow) {
      middleware.push(
        arrow({
          element: this.arrowElement!,
        }),
      );
    }

    this.positionConfig = {
      placement: this.placement,
      strategy: this.strategy,
      middleware,
    };
  }

  static get styles() {
    return [
      defaultStyles,
      css`
        :host {
          position: relative;
        }
        #content {
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          background-color: var(--cai-popover-bg-color, #fff);
          color: var(--cai-popover-color, #222222);
          transition-property: transform, visibility, opacity;
          border-radius: var(--cai-popover-border-radius, 6px);
          border-width: var(--cai-popover-border-width, 1px);
          border-style: var(--cai-popover-border-style, solid);
          border-color: var(--cai-popover-border-color, #ddd);
          box-shadow: var(--cai-popover-box-shadow-offset-x, 0px)
            var(--cai-popover-box-shadow-offset-y, 0px)
            var(--cai-popover-box-shadow-blur-radius, 20px)
            var(--cai-popover-box-shadow-spread-radius, 0px)
            var(--cai-popover-box-shadow-color, rgba(0, 0, 0, 0.2));
          pointer-events: none;
        }
        #content.shown {
          opacity: 1;
        }
        #content.hidden {
          display: none;
        }
        #content.interactive {
          pointer-events: auto;
        }
        #arrow {
          position: absolute;
          background: var(--cai-popover-bg-color, #fff);
          width: 8px;
          height: 8px;
          transform: rotate(45deg);
        }
        .hidden-layer {
          position: absolute;
          left: calc(var(--cai-popover-icon-size, 24px) * -1);
          width: var(--cai-popover-icon-size, 24px);
          height: calc(var(--cai-popover-icon-size, 24px) * 3);
          top: calc(var(--cai-popover-icon-size, 24px) * -1);
        }
      `,
    ];
  }

  private _showTooltip() {
    this._isShown = true;
    this._updatePosition();
  }

  private _hideTooltip() {
    this._isShown = false;
  }

  private _cleanupTriggers() {
    while (this._eventCleanupFns.length) {
      const cleanup = this._eventCleanupFns.shift();
      cleanup?.();
    }
  }

  private _setTriggers() {
    this._cleanupTriggers();
    const triggers = this.trigger.split(/\s+/);

    this._eventCleanupFns = triggers.map((trigger) => {
      const [show, hide] = trigger.split(':');
      this.triggerElement!.addEventListener(show, this._showTooltip.bind(this));
      if (this.interactive && hide === 'mouseleave') {
        this.hostElement!.addEventListener(hide, this._hideTooltip.bind(this));
      } else {
        this.triggerElement!.addEventListener(
          hide,
          this._hideTooltip.bind(this),
        );
      }
      return () => {
        this.triggerElement!.removeEventListener(show, this._showTooltip);
        if (this.interactive && hide === 'mouseleave') {
          this.contentElement!.addEventListener(
            hide,
            this._hideTooltip.bind(this),
          );
        } else {
          this.triggerElement!.removeEventListener(hide, this._hideTooltip);
        }
      };
    });
  }

  private async _updatePosition() {
    const { x, y, middlewareData, placement } = await computePosition(
      this.triggerElement!,
      this.contentElement!,
      this.positionConfig,
    );

    Object.assign(this.contentElement!.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    if (this.arrow && this.arrowElement && middlewareData.arrow) {
      const { x: ax, y: ay } = middlewareData.arrow;
      const style = this.computeArrowStyle(ax, ay, placement);
      Object.assign(this.arrowElement.style, style);
    }
  }

  private computeArrowStyle(
    x: number | undefined,
    y: number | undefined,
    placement: Placement,
  ) {
    const staticAxisOffset = -4;
    const base = {
      top: '',
      left: '',
      bottom: '',
      right: '',
    };

    // Split to turn left-end, left-start, etc into left
    switch (placement.split('-')[0]) {
      case 'bottom':
        return {
          ...base,
          top: `${staticAxisOffset}px`,
          left: x !== null ? `${x}px` : '',
        };
      case 'top':
        return {
          ...base,
          left: x !== null ? `${x}px` : '',
          bottom: `${staticAxisOffset}px`,
        };
      case 'left':
        return {
          ...base,
          top: y !== null ? `${y}px` : '',
          right: `${staticAxisOffset}px`,
        };
      case 'right':
        return {
          ...base,
          top: y !== null ? `${y}px` : '',
          left: `${staticAxisOffset}px`,
        };
      default:
        return {
          ...base,
          display: 'none',
        };
    }
  }

  firstUpdated(): void {
    this._setTriggers();
    this._updateCleanupFn = autoUpdate(
      this.triggerElement!,
      this.contentElement!,
      () => {
        this._updatePosition();
      },
    );

    this.contentElement?.classList.add('hidden');
  }

  disconnectedCallback(): void {
    this._updateCleanupFn?.();
    this._cleanupTriggers();
    super.disconnectedCallback();
  }

  render() {
    const contentClassMap = {
      shown: this._isShown,
      interactive: this.interactive,
      tab: this.tab,
    };
    const contentStyleMap = {
      'z-index': this.zIndex.toString(),
    };

    return html`<div id="element">
      <div
        id="content"
        class=${classMap(contentClassMap)}
        style=${styleMap(contentStyleMap)}
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
        ${this.arrow ? html`<div id="arrow"></div>` : null}
      </div>

      <div id="trigger" ${this.tab && `tabindex="0"`}>
        <div class="hidden-layer"></div>
        <slot name="trigger"></slot>
      </div>
    </div>`;
  }
}
