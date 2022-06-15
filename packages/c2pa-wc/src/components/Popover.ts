import {
  arrow,
  autoUpdate,
  computePosition,
  ComputePositionConfig,
  flip,
  offset,
  Placement,
  shift,
  Strategy,
} from '@floating-ui/dom';
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import '../../assets/svg/monochrome/help.svg';
import { PartPrefixable } from '../mixins/PartPrefixable';
import { defaultStyles } from '../styles';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cai-popover': any;
    }
  }
}

@customElement('cai-popover')
export class Popover extends PartPrefixable(LitElement) {
  private _updateCleanupFn: Function | null = null;
  private _eventCleanupFns: Function[] = [];

  static readonly cssParts: Record<string, string> = {
    arrow: 'popover-arrow',
    box: 'popover-box',
    content: 'popover-content',
  };

  @property({ type: String })
  placement: Placement = 'right-start';

  @property({ type: String })
  strategy: Strategy = 'absolute';

  @property({ type: Boolean })
  arrow = true;

  @property({ type: Object })
  flip = null;

  @property({ type: Object })
  offset = { mainAxis: 10 };

  @property({ type: Object })
  shift = { padding: 10 };

  @property({ type: Boolean })
  interactive = false;

  @property({ type: String })
  trigger: string = 'mouseenter:mouseleave focus:blur';

  @query('#arrow')
  arrowElement: HTMLElement | undefined;

  @query('#content')
  contentElement: HTMLElement | undefined;

  @query('#trigger')
  triggerElement: HTMLElement | undefined;

  @property({ attribute: false })
  modifyConfig: (
    config: Partial<ComputePositionConfig>,
  ) => Partial<ComputePositionConfig> = (
    config: Partial<ComputePositionConfig>,
  ) => config;

  static get styles() {
    return [
      defaultStyles,
      css`
        #content {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          background-color: var(--cai-popover-bg-color, #fff);
          color: var(--cai-popover-color, #222222);
          transition-property: transform, visibility, opacity;
          border-radius: 6px;
          border: 1px solid var(--cai-popover-border-color, #ddd);
        }
        #trigger {
          cursor: pointer;
        }
      `,
    ];
  }

  private _showTooltip() {
    this.contentElement!.style.display = 'block';
    this._updatePosition();
  }

  private _hideTooltip() {
    this.contentElement!.style.display = '';
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
        this.contentElement!.addEventListener(
          hide,
          this._hideTooltip.bind(this),
        );
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

  private _getPositionConfig(): Partial<ComputePositionConfig> {
    const middleware: ComputePositionConfig['middleware'] = [];
    if (this.arrow) {
      middleware.push(
        arrow({
          element: this.arrowElement!,
        }),
      );
    }
    if (this.flip) {
      middleware.push(flip(this.flip));
    }
    if (this.offset) {
      middleware.push(offset(this.offset));
    }
    if (this.shift) {
      middleware.push(shift(this.shift));
    }
    return this.modifyConfig({
      placement: this.placement,
      strategy: this.strategy,
      middleware,
    });
  }

  private _updatePosition() {
    computePosition(
      this.triggerElement!,
      this.contentElement!,
      this._getPositionConfig(),
    ).then(({ x, y }) => {
      Object.assign(this.contentElement!.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
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
  }

  disconnectedCallback(): void {
    this._updateCleanupFn?.();
    this._cleanupTriggers();
    super.disconnectedCallback();
  }

  render() {
    return html`<div id="element">
      <div id="content" part=${Popover.cssParts.content}>
        <slot name="content"></slot>
        ${this.arrow
          ? html`<div id="arrow" part=${Popover.cssParts.arrow}></div>`
          : null}
      </div>
      <div id="trigger" part=${Popover.cssParts.trigger}>
        <slot name="trigger"></slot>
      </div>
    </div>`;
  }
}
