import { useC2pa, useThumbnailUrl, L2Image } from '@contentauth/react';
import {
  C2paReadResult,
  generateVerifyUrl,
  Manifest,
  selectProducer,
  L2Manifest,
  createL2Manifest,
} from 'c2pa';
import 'c2pa-wc/dist/components/Icon';
import 'c2pa-wc/dist/components/Indicator';
import 'c2pa-wc/dist/components/panels/ManifestSummary';
import { ManifestSummary } from 'c2pa-wc/dist/components/panels/ManifestSummary';
import 'c2pa-wc/dist/components/panels/PanelSection';
import 'c2pa-wc/dist/components/Popover';
import { useEffect, useRef, useState } from 'react';
import './App.css';

const sampleImage =
  'https://raw.githubusercontent.com/contentauth/c2pa-js/main/tools/testing/fixtures/images/CAICAI.jpg';

interface ManifestInfoProps {
  manifest: Manifest;
  viewMoreUrl: string;
}

interface WebComponentsProps {
  imageUrl: string;
  provenance: C2paReadResult;
  viewMoreUrl: string;
}

function ManifestInfo({ manifest, viewMoreUrl }: ManifestInfoProps) {
  const thumbnailUrl = useThumbnailUrl(manifest?.thumbnail ?? undefined);
  const producer = selectProducer(manifest);

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
          <td>{manifest.claimGenerator}</td>
        </tr>
        <tr>
          <td>Signed by</td>
          <td>{manifest.signatureInfo?.issuer}</td>
        </tr>
        <tr>
          <td>Signed on</td>
          <td>{manifest.signatureInfo?.time?.toLocaleString()}</td>
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
  const [manifest, setManifest] = useState<L2Manifest | null>(null);
  const summaryRef = useRef<ManifestSummary>();

  useEffect(() => {
    let disposeFn = () => {};

    if (!provenance.manifestStore?.activeManifest) {
      return;
    }

    createL2Manifest(provenance.manifestStore?.activeManifest).then(
      ({ manifest, dispose }) => {
        setManifest(manifest);
        disposeFn = dispose;
      },
    );

    return disposeFn;
  }, [provenance.manifestStore?.activeManifest]);

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
  const provenance = useC2pa(sampleImage);
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
