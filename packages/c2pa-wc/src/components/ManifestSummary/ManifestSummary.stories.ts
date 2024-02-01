/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { Meta, Story } from '@storybook/web-components';
import { L2ManifestStore } from 'c2pa';
import { html } from 'lit';
import defaultManifest from '../../../storybook/fixtures/manifest';
import '../../../storybook/themes/spectrum.css';

import '../PanelSection';
import './ManifestSummary';
import { ManifestSummaryConfig } from './ManifestSummary';

interface ArgTypes {
  manifestStore: L2ManifestStore;
  config?: Partial<ManifestSummaryConfig>;
  viewMoreUrl: string;
  theme?: string;
}

export default {
  title: 'Components/ManifestSummary',
  component: 'cai-manifest-summary',
  argTypes: {
    manifestStore: {
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
        <div class="bg-white drop-shadow-xl rounded-lg w-min ">${story()}</div>
      </div>`,
  ],
} as Meta;

const Base: Story<ArgTypes> = ({
  manifestStore,
  config,
  viewMoreUrl,
  theme,
}: ArgTypes) => {
  return html`
    <cai-manifest-summary
      .manifestStore=${manifestStore}
      .config=${config}
      view-more-url=${viewMoreUrl}
      class=${theme}
    ></cai-manifest-summary>
  `;
};

export const Default = Base.bind({});
Default.args = {
  manifestStore: defaultManifest,
};

export const Styled = Base.bind({});
Styled.args = {
  manifestStore: defaultManifest,
  theme: 'theme-spectrum',
};

export const AppendCustomSection: Story<ArgTypes> = ({
  manifestStore,
  config,
  viewMoreUrl,
  theme,
}: ArgTypes) => {
  return html`
    <cai-manifest-summary
      .manifestStore=${manifestStore}
      .config=${config}
      view-more-url=${viewMoreUrl}
      class=${theme}
    >
      <cai-panel-section helpText="This is a custom section">
        <div slot="header">Custom section</div>
        <div slot="content">pre</div>
        Number of ingredients:
        ${manifestStore.ingredients?.length}</cai-panel-section
      >
      <cai-panel-section helpText="This is a custom section">
        <div slot="header">Custom section</div>
        <div slot="content">post</div>
        Number of ingredients:
        ${manifestStore.ingredients?.length}</cai-panel-section
      >
    </cai-manifest-summary>
  `;
};
AppendCustomSection.args = {
  manifestStore: defaultManifest,
};
