import { createC2pa, generateVerifyUrl } from 'c2pa';
import wasmSrc from 'c2pa/dist/assets/wasm/toolkit_bg.wasm?url';
import workerSrc from 'c2pa/dist/c2pa.worker.js?url';
import 'c2pa-wc';
import { getManifestSummaryStore } from 'c2pa-wc';

(async () => {
  const c2pa = await createC2pa({
    wasmSrc,
    workerSrc,
  });

  try {
    const image = document.querySelector('img');

    if (!image) {
      return;
    }

    const { manifestStore } = await c2pa.read(image);

    if (!manifestStore) {
      return;
    }

    const manifestSummary = document.querySelector(
      'cai-manifest-summary-v2',
    ) as any;

    manifestSummary.manifestStore = getManifestSummaryStore(manifestStore);
    manifestSummary.inspectUrl = generateVerifyUrl(image.src);
  } catch (err) {
    console.error('Error reading image:', err);
  }
})();
