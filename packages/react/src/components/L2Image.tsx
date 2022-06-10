/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { ManifestSummary } from 'c2pa-wc';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useC2pa, useSerialized } from '../hooks';
import { generateVerifyUrl } from 'c2pa';

interface L2ImageProps
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {}

const Wrapper = styled.div`
  position: relative;

  & > img {
    width: 100%;
    height: auto;
  }

  & cai-popover {
    position: absolute;
    top: 10px;
    right: 10px;
  }
`;

export function L2Image(props: L2ImageProps) {
  const { srcSet, ...imgProps } = props;

  if (srcSet) {
    throw new Error('<L2Image> does not support srcSet. Use src instead');
  }

  const summaryRef = useRef<ManifestSummary>();
  const c2pa = useC2pa(props.src);
  const serializedManifest = useSerialized(c2pa?.manifestStore?.activeManifest);

  const viewMoreUrl = props.src ? generateVerifyUrl(props.src) : '';

  useEffect(() => {
    const summaryElement = summaryRef.current;
    if (summaryElement && serializedManifest) {
      summaryElement.manifest = serializedManifest;
      summaryElement.viewMoreUrl = viewMoreUrl;
    }
  }, [summaryRef, serializedManifest]);

  return (
    <Wrapper>
      <img {...imgProps} />
      {serializedManifest ? (
        <cai-popover interactive>
          <cai-indicator slot="trigger"></cai-indicator>
          <cai-manifest-summary
            ref={summaryRef}
            slot="content"
          ></cai-manifest-summary>
        </cai-popover>
      ) : null}
    </Wrapper>
  );
}
