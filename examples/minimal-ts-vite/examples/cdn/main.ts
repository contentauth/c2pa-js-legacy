const sampleImage =
  'https://raw.githubusercontent.com/contentauth/c2pa-js/main/tools/testing/fixtures/images/CAICAI.jpg';

(async () => {
  // Information about where to fetch the library
  const version = '0.17.2';
  const libraryUrl = `https://cdn.jsdelivr.net/npm/c2pa@${version}/+esm`;

  // Initialize the c2pa-js SDK
  const { createC2pa } = await import(libraryUrl);
  const c2pa = await createC2pa({
    wasmSrc: `https://cdn.jsdelivr.net/npm/c2pa@${version}/dist/assets/wasm/toolkit_bg.wasm`,
    workerSrc: `https://cdn.jsdelivr.net/npm/c2pa@${version}/dist/c2pa.worker.min.js`,
  });

  // Read in our sample image and get a manifest store
  try {
    const { manifestStore } = await c2pa.read(sampleImage);
    console.log('manifestStore', manifestStore);

    // Get the active manifest
    const activeManifest = manifestStore?.activeManifest;
    console.log('activeManifest', activeManifest);
  } catch (err) {
    console.error('Error reading image:', err);
  }
})();
