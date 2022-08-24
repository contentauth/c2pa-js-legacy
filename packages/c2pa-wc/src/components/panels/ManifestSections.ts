import { isValid, parseISO } from 'date-fns';
import defaultStringMap from './ManifestSections.str.json';
import merge from 'lodash/merge';
import { Icon } from '../Icon';
import { Thumbnail } from '../Thumbnail';
import { PanelSection } from './PanelSection';
import { exportParts } from '../../directives/ExportParts';
import { html, TemplateResult } from 'lit';
import { L2Manifest } from 'c2pa';

export interface SectionConfig {
  stringMap: Record<string, string>;
  partMap?: Record<string, string>;
}
interface SectionParams<Config = SectionConfig> {
  manifest: L2Manifest;
  config: Config;
  html: typeof html;
}

export type SectionTemplate = (params: SectionParams) => TemplateResult;

const defaultConfig = {
  stringMap: defaultStringMap,
  showDescriptions: false,
};

export interface MinimumViableProvenanceConfig extends SectionConfig {
  dateFormatter: (date: Date) => string;
  partMap?: Record<'content' | 'thumbnail' | 'signer' | 'date', string>;
  showDescriptions?: boolean;
}

/* eslint-disable @typescript-eslint/no-shadow */
export function MinimumViableProvenance({
  manifest,
  config: customConfig,
  html,
}: SectionParams<MinimumViableProvenanceConfig>): TemplateResult {
  const config = merge({}, defaultConfig, customConfig);
  const signatureDate = manifest.signature?.isoDateString
    ? parseISO(manifest.signature.isoDateString)
    : undefined;
  return html`
    <style>
      .minimum-viable-provenance-content {
        --cai-thumbnail-size: 48px;
        display: grid;
        grid-template-columns: 48px auto;
        grid-gap: 2px 10px;
        text-align: left;
      }
      .minimum-viable-provenance-thumbnail {
        grid-column: 1;
        grid-row: 1 / 3;
      }
      .minimum-viable-provenance-signer {
        grid-column: 2;
        grid-row: 1;
        align-self: flex-end;
        display: grid;
        grid-template-columns: min-content max-content;
        align-items: center;
      }
      .minimum-viable-provenance-signer-label {
        margin-left: 5px;
      }
      .minimum-viable-provenance-date {
        grid-column: 2;
        grid-row: 2;
        color: #6e6e6e;
      }
    </style>
    <cai-panel-section
      header=${config.stringMap['minimum-viable-provenance.header']}
      helpText=${config.stringMap['minimum-viable-provenance.helpText']}
      exportparts=${exportParts(PanelSection.cssParts)}
    >
      <div
        class="minimum-viable-provenance-content"
        part=${config.partMap?.content}
      >
        <cai-thumbnail
          class="minimum-viable-provenance-thumbnail"
          part=${config.partMap?.thumbnail}
          src=${manifest.thumbnail}
          badge="none"
          exportparts=${exportParts(Thumbnail.cssParts)}
        ></cai-thumbnail>
        <div
          class="minimum-viable-provenance-signer"
          part=${config.partMap?.signer}
        >
          <cai-icon
            slot="icon"
            source=${manifest.signature?.issuer}
            exportparts=${exportParts(Icon.cssParts)}
          ></cai-icon>
          <span
            part="minimum-viable-provenance-signer-label"
            class="minimum-viable-provenance-signer-label"
          >
            ${manifest.signature?.issuer}
          </span>
        </div>
        <div
          class="minimum-viable-provenance-date"
          part=${config.partMap?.date}
        >
          ${isValid(signatureDate)
            ? html`${config.dateFormatter(signatureDate!)}`
            : html`${config.stringMap['manifest-summary.invalidDate']}`}
        </div>
      </div>
    </cai-panel-section>
  `;
}

export function ProducedBy({
  manifest,
  config: customConfig,
  html,
}: SectionParams): TemplateResult {
  const config = merge({}, defaultConfig, customConfig);
  return html`
    <cai-panel-section
      header=${config.stringMap['produced-by.header']}
      helpText=${config.stringMap['produced-by.helpText']}
      exportparts=${exportParts(PanelSection.cssParts)}
    >
      <div part="section-produced-by-content">${manifest.producer?.name}</div>
    </cai-panel-section>
  `;
}

export function ProducedWith({
  manifest,
  config: customConfig,
  html,
}: SectionParams): TemplateResult {
  const config = merge({}, defaultConfig, customConfig);
  return html`
    <style>
      .section-produced-with-content {
        display: flex;
        align-items: center;
      }

      .section-produced-with-content-label {
        margin-left: 8px;
      }

      .section-produced-with-beta {
        margin-left: 24px;
      }
    </style>
    <cai-panel-section
      header=${config.stringMap['produced-with.header']}
      helpText=${config.stringMap['produced-with.helpText']}
      exportparts=${exportParts(PanelSection.cssParts)}
    >
      <div>
        <div
          part="section-produced-with-content"
          class="section-produced-with-content"
        >
          <cai-icon
            source="${manifest.claimGenerator.product}"
            exportparts=${exportParts(Icon.cssParts)}
          ></cai-icon>
          <span
            part="section-produced-with-content-label"
            class="section-produced-with-content-label"
          >
            ${manifest.claimGenerator.product}
          </span>
        </div>
        ${false
          ? html`<div
              part="section-produced-with-beta"
              class="section-produced-with-beta"
            >
              ${config.stringMap['produced-with.beta']}
            </div>`
          : null}
      </div>
    </cai-panel-section>
  `;
}

export function EditsAndActivity({
  manifest,
  config: customConfig,
  html,
}: SectionParams<SectionConfig>): TemplateResult {
  const config = merge({}, defaultConfig, customConfig);
  const editsAndActivityData = manifest.editsAndActivity;

  return html`
    <style>
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
        width: 16px;
      }

      .section-edits-and-activity-list-item-label {
        margin-left: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .section-edits-and-activity-list-item-description {
        color: #6e6e6e;
        margin-left: 24px;
      }
    </style>

    <cai-panel-section
      header=${config.stringMap['edits-and-activity.header']}
      helpText=${config.stringMap['edits-and-activity.helpText']}
      exportparts=${exportParts(PanelSection.cssParts)}
    >
      <dl
        part="section-edits-and-activity-list"
        class="section-edits-and-activity-list"
      >
        ${editsAndActivityData?.map(
          ({ icon, label, description }) => html`
            <div
              part="section-edits-and-activity-list-item"
              class="section-edits-and-activity-list-item"
            >
              <dt
                part="section-edits-and-activity-list-item-term"
                class="section-edits-and-activity-list-item-term"
              >
                ${icon
                  ? html`<img
                      part="section-edits-and-activity-list-item-icon"
                      class="section-edits-and-activity-list-item-icon"
                      src=${icon}
                      alt=${label}
                    />`
                  : null}
                <span
                  part="section-edits-and-activity-list-item-label"
                  class="section-edits-and-activity-list-item-label"
                >
                  ${label}
                </span>
              </dt>
              ${config.showDescriptions
                ? html`
                    <dd
                      part="section-edits-and-activity-list-item-description"
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
  `;
}

export function SocialMedia({
  manifest,
  config: customConfig,
  html,
}: SectionParams): TemplateResult {
  const config = merge({}, defaultConfig, customConfig);

  return html`
    <style>
      .section-social-media-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        list-style: none;
        padding: 0;
        margin: 0;
        overflow: hidden;
      }

      .section-social-media-list-item {
        display: flex;
        align-items: center;
      }

      .section-social-media-list-item-link {
        color: var(--cai-color);
        margin-left: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    </style>

    <cai-panel-section
      header=${config.stringMap['social-media.header']}
      helpText=${config.stringMap['social-media.helpText']}
      exportparts=${exportParts(PanelSection.cssParts)}
    >
      <ul part="section-social-media-list" class="section-social-media-list">
        ${manifest.socialAccounts?.map(
          (socialAccount) => html`
            <li
              part="section-social-media-list-item"
              class="section-social-media-list-item"
            >
              <cai-icon
                source="${socialAccount['@id']}"
                exportparts=${exportParts(Icon.cssParts)}
              ></cai-icon>
              <a
                part="section-social-media-list-item-link"
                class="section-social-media-list-item-link"
                href=${socialAccount['@id']}
                target="_blank"
              >
                @${socialAccount.name}
              </a>
            </li>
          `,
        )}
      </ul>
    </cai-panel-section>
  `;
}

export function AssetsUsed({
  manifest,
  config: customConfig,
  html,
}: SectionParams): TemplateResult {
  const config = merge({}, defaultConfig, customConfig);

  return html`
    <style>
      .section-assets-used {
        --cai-thumbnail-size: 48px;
        display: grid;
        grid-template-columns: repeat(auto-fill, var(--cai-thumbnail-size));
        grid-gap: 10px;
        text-align: left;
      }
    </style>

    <cai-panel-section
      header=${config.stringMap['assets-used.header']}
      helpText=${config.stringMap['assets-used.helpText']}
      exportparts=${exportParts(PanelSection.cssParts)}
    >
      <div class="section-assets-used">
        ${manifest.ingredients?.map(
          (ingredient) => html`
            <cai-thumbnail
              class="section-assets-used-thumbnail"
              src=${ingredient.thumbnail}
              badge="none"
              exportparts=${exportParts(Thumbnail.cssParts)}
            ></cai-thumbnail>
          `,
        )}
      </div>
    </cai-panel-section>
  `;
}
