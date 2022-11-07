/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2Manifest } from 'c2pa';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Configurable } from '../../mixins/configurable';
import defaultStringMap from './EditsAndActivity.str.json';
import { baseSectionStyles, defaultStyles } from '../../styles';

import '../PanelSection';

declare global {
  interface HTMLElementTagNameMap {
    'cai-edits-and-activity': EditsAndActivity;
  }

  namespace JSX {
    interface IntrinsicElements {
      'cai-edits-and-activity': any;
    }
  }
}

export interface EditsAndActivityConfig {
  stringMap: typeof defaultStringMap;
  showDescriptions: boolean;
}

const defaultConfig: EditsAndActivityConfig = {
  stringMap: defaultStringMap,
  showDescriptions: false,
};

@customElement('cai-edits-and-activity')
export class EditsAndActivity extends Configurable(LitElement, defaultConfig) {
  @property({
    type: Object,
  })
  manifest: L2Manifest | undefined;

  static get styles() {
    return [
      defaultStyles,
      baseSectionStyles,
      css`
        .section-edits-and-activity-content {
          display: flex;
          flex-direction: column;
        }

        .section-edits-and-activity-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          list-style: none;
          padding: 0;
          margin: 0;
          overflow: hidden;
        }

        .section-edits-and-activity-list-item-term {
          display: flex;
          align-items: center;
        }

        .section-edits-and-activity-list-item-icon {
          margin-right: 8px;
          width: 16px;
        }

        .section-edits-and-activity-list-item-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .section-edits-and-activity-list-item-description {
          color: var(--cai-secondary-color);
          margin-left: 24px;
        }
      `,
    ];
  }

  render() {
    const editsAndActivityData = this.manifest?.editsAndActivity;

    return editsAndActivityData?.length
      ? html`
          <cai-panel-section
            header=${this._config.stringMap['edits-and-activity.header']}
            helpText=${this._config.stringMap['edits-and-activity.helpText']}
          >
            <dl class="section-edits-and-activity-list">
              ${editsAndActivityData?.map(
                ({ icon, label, description }) => html`
                  <div class="section-edits-and-activity-list-item">
                    <dt class="section-edits-and-activity-list-item-term">
                      ${icon
                        ? html`<img
                            class="section-edits-and-activity-list-item-icon"
                            src=${icon}
                            alt=${label}
                          />`
                        : null}
                      <span class="section-edits-and-activity-list-item-label">
                        ${label}
                      </span>
                    </dt>
                    ${true
                      ? html`
                          <dd
                            class="section-edits-and-activity-list-item-description"
                          >
                            ${description}
                          </dd>
                        `
                      : null}
                  </div>
                `,
              )}
            </dl>
          </cai-panel-section>
        `
      : nothing;
  }
}
