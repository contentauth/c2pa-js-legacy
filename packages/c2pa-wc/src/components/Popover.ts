import {
  autoUpdate,
  computePosition,
  ComputePositionConfig,
  Placement,
  Strategy,
} from '@floating-ui/dom';
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import intersection from 'lodash/intersection';
import merge from 'lodash/merge';
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

/**
 * These properties are handled by the property/attribute values and cannot be overridden in the `options` map
 */
type AttributePositionProps = 'placement' | 'strategy';
/**
 * These properties are not overridable since it would interfere with proper component functioning
 */
type ImmutablePositionProps = AttributePositionProps;
/**
 * This contains all properties that are overridable via the `options` attribute
 */
type AllowedPositionProps = Partial<
  Omit<ComputePositionConfig, ImmutablePositionProps>
>;

@customElement('cai-popover')
export class Popover extends PartPrefixable(LitElement) {
  private _updateCleanupFn: Function | null = null;

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
  interactive = true;

  /**
   * Allows you to override default computePosition options specified in the `AllowedPositionProps` type
   */
  @property({ type: Object })
  options: AllowedPositionProps = {};

  @property({ type: String })
  trigger: string = 'mouseenter focus';

  @query('#arrow')
  arrowElement: HTMLElement | undefined;

  @query('#content')
  contentElement: HTMLElement | undefined;

  @query('#trigger')
  triggerElement: HTMLElement | undefined;

  static get styles() {
    return [
      defaultStyles,
      css`
        #content {
          position: absolute;
          top: 0;
          left: 0;
        }
      `,
    ];
  }

  private _getPositionConfig(): ComputePositionConfig {
    return {
      placement: this.placement,
      strategy: this.strategy,
    } as ComputePositionConfig;
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
    super.disconnectedCallback();
  }

  render() {
    return html`<div id="element">
      <div id="content">
        <slot name="content"></slot>
      </div>
      <div id="trigger">
        <slot name="trigger"></slot>
      </div>
    </div>`;
  }
}
