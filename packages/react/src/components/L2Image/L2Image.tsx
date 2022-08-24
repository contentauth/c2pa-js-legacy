/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ManifestSummary } from 'c2pa-wc';
import React, { useEffect, useRef, useState } from 'react';
import { useC2pa } from '../../hooks';
import { createL2Manifest, generateVerifyUrl, L2Manifest } from 'c2pa';
import classNames from 'classnames';

import styles from './L2Image.scss';

interface L2ImageProps
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  wcClassName?: string;
  wrapperClass?: React.HTMLAttributes<HTMLDivElement>['className'];
  wrapperStyle?: React.HTMLAttributes<HTMLDivElement>['style'];
}

export function L2Image(props: L2ImageProps) {
  const { srcSet, wcClassName, wrapperClass, wrapperStyle, ...imgProps } =
    props;

  if (srcSet) {
    throw new Error('<L2Image> does not support srcSet. Use src instead');
  }

  const [manifest, setManifest] = useState<L2Manifest | null>(null);
  const summaryRef = useRef<ManifestSummary>();
  const c2pa = useC2pa(props.src);

  useEffect(() => {
    let disposeFn = () => {};

    if (!c2pa?.manifestStore?.activeManifest) {
      return;
    }

    createL2Manifest(c2pa.manifestStore?.activeManifest).then(
      ({ manifest: componentL2Manifest, dispose }) => {
        setManifest(componentL2Manifest);
        disposeFn = dispose;
      },
    );

    return disposeFn;
  }, [c2pa?.manifestStore?.activeManifest]);

  const viewMoreUrl = props.src ? generateVerifyUrl(props.src) : '';

  useEffect(() => {
    const summaryElement = summaryRef.current;
    if (summaryElement && manifest) {
      summaryElement.manifest = manifest;
      summaryElement.viewMoreUrl = viewMoreUrl;
    }
  }, [summaryRef, manifest]);

  return (
    <div
      style={wrapperStyle}
      className={classNames([wrapperClass, styles.wrapper])}
    >
      <img {...imgProps} />
      {manifest ? (
        <cai-popover interactive class={wcClassName}>
          <cai-indicator slot="trigger" class={wcClassName}></cai-indicator>
          <cai-manifest-summary
            ref={summaryRef}
            slot="content"
            class={wcClassName}
          ></cai-manifest-summary>
        </cai-popover>
      ) : null}
    </div>
  );
}
