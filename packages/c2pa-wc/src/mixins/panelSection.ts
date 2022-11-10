/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { L2ManifestStore } from 'c2pa';
import { LitElement, nothing, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export declare class PanelSectionInterface<DataType> {
  manifestStore: L2ManifestStore | undefined;
  protected _data: DataType;
  protected _isEmpty: boolean;
  renderSection: (content: TemplateResult) => TemplateResult;
}

export interface PanelSectionConfig<DataType> {
  dataSelector: (manifestStore: L2ManifestStore) => DataType;
  isEmpty?: (data: DataType) => boolean;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export const PanelSection = <T extends Constructor<LitElement>, DataType>(
  superClass: T,
  config: PanelSectionConfig<DataType>,
) => {
  class PanelSectionMixin extends superClass {
    @property({
      type: Object,
    })
    manifestStore: L2ManifestStore | undefined;

    @property({ type: Boolean, reflect: true })
    protected empty: boolean = false;

    @state()
    protected _data: DataType | null = null;

    willUpdate(changed: Map<string, any>) {
      super.willUpdate(changed);
      if (changed.has('manifestStore')) {
        this._data = this.manifestStore
          ? config.dataSelector(this.manifestStore)
          : null;

        this.empty = this._data
          ? config.isEmpty
            ? config.isEmpty(this._data)
            : !this._data
          : true;
      }
    }

    renderSection(content: TemplateResult) {
      return this.empty ? nothing : content;
    }
  }

  // @TODO: fix casting issue
  return PanelSectionMixin as unknown as Constructor<
    PanelSectionInterface<DataType>
  > &
    T;
};
