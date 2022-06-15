import { createC2pa } from 'c2pa';
import wasmModule from 'c2pa/dist/assets/wasm/toolkit_bg.wasm';

const sampleImage =
  'https://raw.githubusercontent.com/contentauth/c2pa-js/main/tools/testing/fixtures/images/CAICAI.jpg';

(async () => {
  // Initialize the c2pa-js SDK
  const wasmSrc = await wasmModule();
  const c2pa = await createC2pa({
    wasmSrc,
    workerSrc: 'c2pa.worker.min.js',
  });

  try {
    // Read in our sample image and get a manifest store
    const { manifestStore } = await c2pa.read(sampleImage);
    console.log('manifestStore', manifestStore);

    // Get the active manifest
    const activeManifest = manifestStore?.activeManifest;
    console.log('activeManifest', activeManifest);
  } catch (err) {
    console.error('Error reading image:', err);
  }
})();
