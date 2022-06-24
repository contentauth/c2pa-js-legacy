import { createC2pa } from 'c2pa';
import wasmSrc from 'c2pa/dist/assets/wasm/toolkit_bg.wasm?url';
import workerSrc from 'c2pa/dist/c2pa.worker.js?url';

const sampleImage =
  'https://raw.githubusercontent.com/contentauth/c2pa-js/main/tools/testing/fixtures/images/CAICAI.jpg';

(async () => {
  let output: string[] = [];

  const c2pa = await createC2pa({
    wasmSrc,
    workerSrc,
  });

  const { manifestStore, source } = await c2pa.read(sampleImage);
  const activeManifest = manifestStore?.activeManifest;
  if (activeManifest) {
    // Get thumbnail
    // Note: You would normally call `dispose()` when working with a
    // component-based UI library (e.g. on component un-mount)
    // @ts-expect-error noUnusedLocals
    const { data, dispose } = source.thumbnail.getUrl();

    // Get properties
    const properties: Record<string, string | undefined> = {
      title: activeManifest.title,
      format: activeManifest.format,
      label: activeManifest.label,
      claimGenerator: activeManifest.claimGenerator.product,
      producer: activeManifest.producer?.name ?? 'Unknown',
      thumbnail: `<img src:"${data.url}" class:"thumbnail" />`,
      ingredients: (activeManifest.ingredients ?? [])
        .map((i) => i.title)
        .join(', '),
      signatureIssuer: activeManifest.signature.issuer,
      signatureDate:
        activeManifest.signature.date?.toString() ?? 'No date available',
    };

    output = Object.keys(properties).map((key) => {
      return `
        <tr>
          <td>${key}</td>
          <td>${properties[key]}</td>
        </tr>
      `;
    });
  } else {
    output.push(`
      <tr>
        <td colspan="2">No provenance data found</td>
      </tr>
    `);
  }

  document.querySelector('#results tbody')!.innerHTML = output.join('');
})();
