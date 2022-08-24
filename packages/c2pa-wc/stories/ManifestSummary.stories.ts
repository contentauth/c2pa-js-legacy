import { Story, Meta } from '@storybook/web-components';
import { L2Manifest } from 'c2pa';
import { html } from 'lit';
import {
  ManifestSummary,
  ManifestSummaryConfig,
} from '../src/components/panels/ManifestSummary';
import defaultManifest from './fixtures/manifest';
import './themes/spectrum.css';

// For some reason, the component fails to load unless it is referenced beforehand
// TODO: Look into why the web component needs to be referenced to work, unlike `cai-thumbnail`
console.log('ManifestSummary', ManifestSummary);

interface ArgTypes {
  manifest: L2Manifest;
  config?: Partial<ManifestSummaryConfig>;
  viewMoreUrl: string;
  theme?: string;
}

export default {
  title: 'Components/ManifestSummary',
  component: 'cai-manifest-summary',
  argTypes: {
    manifest: {
      control: {
        type: 'object',
      },
    },
    config: {
      control: {
        type: 'object',
      },
    },
    viewMoreUrl: {
      defaultValue: 'https://verify.contentauthenticity.org/inspect',
      control: {
        type: 'text',
      },
    },
    theme: {
      defaultValue: '',
      control: {
        type: 'select',
        options: ['', 'theme-spectrum'],
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story) =>
      html`<div class="bg-gray-50 w-full h-screen p-8">
        <div class="bg-white drop-shadow-xl rounded w-min">${story()}</div>
      </div>`,
  ],
} as Meta;

const Base: Story<ArgTypes> = ({
  manifest,
  config,
  viewMoreUrl,
  theme,
}: ArgTypes) => {
  return html`
    <cai-manifest-summary
      .manifest=${manifest}
      .config=${config}
      view-more-url=${viewMoreUrl}
      class=${theme}
    ></cai-manifest-summary>
  `;
};

export const Default = Base.bind({});
Default.args = {
  manifest: defaultManifest,
};

export const Styled = Base.bind({});
Styled.args = {
  manifest: defaultManifest,
  theme: 'theme-spectrum',
};

export const AppendCustomSection = Base.bind({});
AppendCustomSection.args = {
  manifest: defaultManifest,
  config: {
    sections: (defaults) => {
      return {
        ...defaults,
        custom1: ({ manifest, html }) => {
          return html`
            <style>
              .custom1-label {
                font-weight: bold;
                color: blue;
              }
            </style>
            <cai-panel-section
              header="Custom section"
              helpText="This is the help text for my custom section"
            >
              <div>
                <span class="custom1-label">Number of ingredients:</span>
                ${manifest.ingredients.length}
              </div>
            </cai-panel-section>
          `;
        },
      };
    },
  },
};
