import { omitDeep } from 'deepdash-es/standalone';
import { getManifestStoreFromArrayBuffer } from '../../pkg/toolkit';
import type { ManifestStoreFixture } from './ManifestStoreFixture';

export interface ValidationStatus {
  code: string;
  url: string;
  explanation: string;
}

export interface TestContext {
  data: any;
  fixture: ManifestStoreFixture | null;
}

export async function loadTestData(filename: string, hasFixture = true) {
  const parts = /(.*)\.(\w{2,4})$/;
  const [, assetBase, assetExt] = parts.exec(filename) || [null, null, null];
  const testImage = await fetch(`./node_modules/@contentauth/testing/fixtures/images/${assetBase}.${assetExt}`).then(
    (x) => x.blob(),
  );
  const fixture = hasFixture
    ? ((await fetch(`./node_modules/@contentauth/testing/fixtures/manifest-store/${assetBase}.json`).then(
        (x) => x.json(),
      )) as ManifestStoreFixture)
    : null;
  const buffer = await testImage.arrayBuffer();
  const data = await getManifestStoreFromArrayBuffer(buffer, testImage.type);

  return { data, fixture };
}

function omitBinaryFields(data: any) {
  return omitDeep(data, ['hash', 'pad'], { onMatch: { skipChildren: true } });
}

function expectMatchesValidation(this: TestContext) {
  const activeLabel = this.data.activeManifest;
  const activeManifest = this.data.manifests[activeLabel];
  const expected = this.fixture!.validation_status;
  expect(activeManifest.errors).toEqual(
    jasmine.arrayContaining(expected ?? []),
  );
}

export function itMatchesFixture(this: TestContext) {
  it('has the correct active manifest', function (this: TestContext) {
    expect(this.data.activeManifest).toEqual(this.fixture!.active_manifest);
  });

  it('has the correct manifest chain', function (this: TestContext) {
    expect(Object.keys(this.data.manifests)).toEqual(
      jasmine.arrayWithExactContents(Object.keys(this.fixture!.manifests)),
    );
  });

  it('matches manifest data', function (this: TestContext) {
    Object.keys(this.fixture!.manifests).forEach((manifestId) => {
      const manifest = this.data.manifests[manifestId];
      const expected = this.fixture!.manifests[manifestId];

      // Test claim generator
      expect(manifest.claimGenerator).toEqual(expected.claim_generator);

      // Test asset
      expect(manifest.title).toEqual(expected.asset.title);
      expect(manifest.format).toEqual(expected.asset.format);
      expect(manifest.instanceId).toEqual(expected.asset.instance_id);
      expect(manifest.thumbnail.content_type).toEqual(
        expected.asset.thumbnail.format,
      );
    });
  });

  it('matches signature data', function (this: TestContext) {
    Object.keys(this.fixture!.manifests).forEach((manifestId) => {
      const manifest = this.data.manifests[manifestId];
      const expected = this.fixture!.manifests[manifestId];

      expect(manifest.signature.issuer).toMatch(expected.signature.issuer);
      pending('Waiting for WASM timestamp fix');
      expect(manifest.signature.time).toMatch(expected.signature.time);
    });
  });

  it('matches assertion data', function (this: TestContext) {
    Object.keys(this.fixture!.manifests).forEach((manifestId) => {
      const manifest = this.data.manifests[manifestId];
      const expected = this.fixture!.manifests[manifestId];

      expected.assertions.forEach((expectedAssertion) => {
        const assertion = omitBinaryFields(
          manifest.assertions[expectedAssertion.label],
        );
        expect(assertion).toEqual(
          jasmine.objectContaining(omitBinaryFields(expectedAssertion.data)),
        );
      });
    });
  });

  it('matches ingredient data', function (this: TestContext) {
    Object.keys(this.fixture!.manifests).forEach((manifestId) => {
      const manifest = this.data.manifests[manifestId];
      const expected = this.fixture!.manifests[manifestId];

      expected.ingredients.forEach((expectedIngredient) => {
        const { ingredient, manifestId, thumbnail } = manifest.ingredients.find(
          (x: any) =>
            x.ingredient.instanceID === expectedIngredient.instance_id,
        );
        const expectedValidationStatus = expectedIngredient.validation_status;
        expect(ingredient['dc:title']).toEqual(expectedIngredient.title);
        expect(ingredient['dc:format']).toEqual(expectedIngredient.format);
        expect(ingredient.documentID).toEqual(expectedIngredient.document_id);
        expect(thumbnail.content_type).toEqual(
          expectedIngredient.thumbnail.format,
        );
        expect(ingredient.relationship === 'parentOf').toEqual(
          !!expectedIngredient.is_parent,
        );
        expect(ingredient.validationStatus).toEqual(
          expectedValidationStatus
            ? jasmine.arrayContaining(expectedValidationStatus)
            : undefined,
        );
        expect(manifestId).toEqual(expectedIngredient.active_manifest);
      });
    });
  });

  it('matches credential data', function (this: TestContext) {
    Object.keys(this.fixture!.manifests).forEach((manifestId) => {
      const manifest = this.data.manifests[manifestId];
      const expected = this.fixture!.manifests[manifestId];

      expected.credentials.forEach((expectedCredential, idx) => {
        const credentials = omitBinaryFields(manifest.credentials[idx]);
        expect(credentials).toEqual(
          jasmine.objectContaining(omitBinaryFields(expectedCredential)),
        );
      });
    });
  });

  it('matches validation result', expectMatchesValidation);
}

export function itMatchesValidation(this: TestContext) {
  it('matches validation result', expectMatchesValidation);
}
