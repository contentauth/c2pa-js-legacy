import { useC2pa, useThumbnailUrl } from '@contentauth/react';
import {
  C2paReadResult,
  generateVerifyUrl,
  Manifest,
  SerializableManifestData,
} from 'c2pa';
import 'c2pa-wc/dist/components/Icon';
import 'c2pa-wc/dist/components/Indicator';
import 'c2pa-wc/dist/components/panels/ManifestSummary';
import { ManifestSummary } from 'c2pa-wc/dist/components/panels/ManifestSummary';
import 'c2pa-wc/dist/components/panels/PanelSection';
import 'c2pa-wc/dist/components/Popover';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Resolvers } from './main';

const sampleImage =
  'https://raw.githubusercontent.com/contentauth/c2pa-js/main/tools/testing/fixtures/images/CAICAI.jpg';

interface ManifestInfoProps {
  manifest: Manifest<Resolvers>;
  viewMoreUrl: string;
}

interface WebComponentsProps {
  imageUrl: string;
  provenance: C2paReadResult<Resolvers>;
  viewMoreUrl: string;
}

function ManifestInfo({ manifest, viewMoreUrl }: ManifestInfoProps) {
  const thumbnailUrl = useThumbnailUrl(manifest?.thumbnail);
  const producer = manifest?.producer;

  return (
    <table className="claim-info">
      <tbody>
        {thumbnailUrl ? (
          <tr>
            <td colSpan={2}>
              <img src={thumbnailUrl} style={{ width: 250, height: 'auto' }} />
            </td>
          </tr>
        ) : null}
        {producer ? (
          <tr>
            <td>Producer</td>
            <td>{producer.name}</td>
          </tr>
        ) : null}
        <tr>
          <td>Produced with</td>
          <td>{manifest.claimGenerator.value}</td>
        </tr>
        <tr>
          <td>Signed by</td>
          <td>{manifest.signature.issuer}</td>
        </tr>
        <tr>
          <td>Signed on</td>
          <td>{manifest.signature.date?.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Number of ingredients</td>
          <td>{manifest.ingredients?.length}</td>
        </tr>
        <tr>
          <td colSpan={2}>
            <a href={viewMoreUrl} target="_blank">
              View more
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function WebComponents({
  imageUrl,
  provenance,
  viewMoreUrl,
}: WebComponentsProps) {
  const [manifest, setManifest] =
    useState<SerializableManifestData<Resolvers> | null>(null);
  const summaryRef = useRef<ManifestSummary>();

  useEffect(() => {
    let dispose = () => {};
    provenance.manifestStore?.activeManifest
      ?.asSerializable()
      .then((result) => {
        setManifest(result.data);
        dispose = result.dispose;
      });
    return dispose;
  }, [provenance.manifestStore?.activeManifest.label]);

  useEffect(() => {
    const summaryElement = summaryRef.current;
    if (summaryElement && manifest) {
      summaryElement.manifest = manifest;
      summaryElement.viewMoreUrl = viewMoreUrl;
    }
  }, [summaryRef, manifest]);

  return (
    <div className="web-components">
      <div className="wrapper">
        <img src={imageUrl} />
        {manifest ? (
          <div>
            <cai-popover interactive class="theme-spectrum">
              <cai-indicator slot="trigger"></cai-indicator>
              <cai-manifest-summary
                ref={summaryRef}
                slot="content"
              ></cai-manifest-summary>
            </cai-popover>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  const provenance = useC2pa<Resolvers>(sampleImage);
  const viewMoreUrl = generateVerifyUrl(sampleImage);

  return (
    <div className="app">
      {provenance?.manifestStore ? (
        <div>
          <h3>Web components</h3>
          <WebComponents
            imageUrl={sampleImage}
            provenance={provenance}
            viewMoreUrl={viewMoreUrl}
          />
          <h3>React component</h3>
          <ManifestInfo
            manifest={provenance.manifestStore.activeManifest}
            viewMoreUrl={viewMoreUrl}
          />
        </div>
      ) : null}
    </div>
  );
}

export default App;
