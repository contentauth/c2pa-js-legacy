/**
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ArgTypes, Meta, Story } from '@storybook/web-components';
import { html } from 'lit-html';

import './ManifestSummaryV2';
import { ManifestSummaryStore } from '../../getManifestSummaryData';

export default {
  title: 'Components/ManifestSummaryV2',
  component: 'cai-manifest-summary-v2',
  argTypes: {
    manifestStore: {
      control: {
        type: 'object',
      },
    },
    inspectUrl: {
      defaultValue: 'https://verify.contentauthenticity.org/inspect',
      control: {
        type: 'text',
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

const Base: Story<ArgTypes> = ({ manifestStore, inspectUrl }: ArgTypes) => {
  return html`<cai-manifest-summary-v2
    style="width: 300px;"
    .manifestStore=${manifestStore}
    .inspectUrl=${inspectUrl}
  ></cai-manifest-summary-v2>`;
};

export const Default = Base.bind({});
Default.args = {
  manifestStore: {
    recorder: 'Example Recorder',
    name: 'John Doe',
    nameVerifier: {
      name: 'LINKEDIN',
      profileUrl: 'https://linkedin.com/in/johndoe',
    },
    socialAccounts: [
      {
        provider: 'twitter.com',
        url: 'https://twitter.com/johndoe',
        username: 'johndoe',
      },
      {
        provider: 'instagram.com',
        url: 'https://instagram.com/johndoe',
        username: 'johndoe',
      },
      {
        provider: 'behance.net',
        url: 'https://behance.net/johndoe',
        username: 'johndoe',
      },
    ],
    contentSummaryTag: 'ai',
    unrecordedChanges: false,
    error: false,
  } as ManifestSummaryStore,
};

export const Minimal = Base.bind({});
Minimal.args = {
  manifestStore: {
    recorder: 'Example Recorder',
    name: null,
    nameVerifier: null,
    socialAccounts: [],
    contentSummaryTag: null,
    unrecordedChanges: false,
    error: false,
  },
};
