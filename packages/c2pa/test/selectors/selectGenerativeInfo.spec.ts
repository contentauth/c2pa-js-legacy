import { C2pa, createC2pa, selectGenerativeInfo } from '../../';

interface TestContext {
  c2pa: C2pa;
}

describe('selectGenerativeInfo', function () {
  describe('#selectGenerativeInfo', function () {
    beforeAll(async function (this: TestContext) {
      this.c2pa = await createC2pa({
        wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
        workerSrc: './dist/c2pa.worker.js',
      });
    });

    it('should find gen AI assertions using v1 actions', async function (this: TestContext) {
      const result = await this.c2pa.read(
        './node_modules/@contentauth/testing/fixtures/images/gen-fill.jpg',
      );
      const manifest = result.manifestStore?.activeManifest;
      expect(manifest).not.toBeNull();
      if (manifest) {
        const genAssertions = selectGenerativeInfo(manifest);
        expect(genAssertions).toEqual([
          {
            assertion: { label: 'c2pa.actions', data: jasmine.any(Object) },
            action: {
              action: 'c2pa.placed',
              digitalSourceType:
                'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
              parameters: jasmine.any(Object),
              softwareAgent: 'Adobe Firefly',
            },
            type: 'trainedAlgorithmicMedia',
            softwareAgent: { name: 'Adobe Firefly' },
          },
          {
            assertion: { label: 'c2pa.actions', data: jasmine.any(Object) },
            action: {
              action: 'c2pa.placed',
              digitalSourceType:
                'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
              parameters: jasmine.any(Object),
              softwareAgent: 'Adobe Firefly',
            },
            type: 'trainedAlgorithmicMedia',
            softwareAgent: { name: 'Adobe Firefly' },
          },
          {
            assertion: {
              label: 'c2pa.actions',
              data: jasmine.any(Object),
            },
            action: {
              action: 'c2pa.placed',
              digitalSourceType:
                'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
              parameters: jasmine.any(Object),
              softwareAgent: 'Adobe Firefly',
            },
            type: 'trainedAlgorithmicMedia',
            softwareAgent: { name: 'Adobe Firefly' },
          },
        ]);
      }
    });

    it('should detect if a file has a gen AI assertion using v1 actions (trained)', async function (this: TestContext) {
      const result = await this.c2pa.read(
        './node_modules/@contentauth/testing/fixtures/images/gen-fill.jpg',
      );
      const manifest = result.manifestStore?.activeManifest;
      expect(manifest).not.toBeNull();
      if (manifest) {
        const genAssertions = selectGenerativeInfo(manifest);
        expect(genAssertions.length).toEqual(3);
        expect(genAssertions[0].type).toEqual('trainedAlgorithmicMedia');
      }
    });

    it('should detect if a file has a gen AI assertion using v1 actions (composite))', async function (this: TestContext) {
      const result = await this.c2pa.read(
        './node_modules/@contentauth/testing/fixtures/images/composite-dst.jpg',
      );
      const manifest = result.manifestStore?.activeManifest;
      expect(manifest).not.toBeNull();
      if (manifest) {
        const genAssertions = selectGenerativeInfo(manifest);
        expect(genAssertions.length).toEqual(1);
        expect(genAssertions[0].type).toEqual(
          'compositeWithTrainedAlgorithmicMedia',
        );
      }
    });

    it('should detect if a file has a gen AI assertion using a legacy assertion', async function (this: TestContext) {
      const result = await this.c2pa.read(
        './node_modules/@contentauth/testing/fixtures/images/firefly-1.jpg',
      );
      const manifest = result.manifestStore?.activeManifest;
      expect(manifest).not.toBeNull();
      if (manifest) {
        const genAssertions = selectGenerativeInfo(manifest);
        expect(genAssertions[0].type).toEqual('legacy');
      }
    });

    it('should detect if a file does not have a gen AI assertion', async function (this: TestContext) {
      const result = await this.c2pa.read(
        './node_modules/@contentauth/testing/fixtures/images/cloud.jpg',
      );
      const manifest = result.manifestStore?.activeManifest;
      expect(manifest).not.toBeNull();
      if (manifest) {
        const genAssertions = selectGenerativeInfo(manifest);
        expect(genAssertions).toEqual(null);
      }
    });

    it('should find gen AI assertions using v2 actions', async function (this: TestContext) {
      const result = await this.c2pa.read(
        './node_modules/@contentauth/testing/fixtures/images/genai-actions-v2.jpg',
      );
      const manifest = result.manifestStore?.activeManifest;
      expect(manifest).not.toBeNull();
      if (manifest) {
        const genAssertions = selectGenerativeInfo(manifest);
        expect(genAssertions).toEqual([
          {
            assertion: { label: 'c2pa.actions.v2', data: jasmine.any(Object) },
            action: {
              action: 'c2pa.edited',
              digitalSourceType:
                'http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia',
              softwareAgent: { name: 'Adobe Firefly' },
            },
            type: 'compositeWithTrainedAlgorithmicMedia',
            softwareAgent: { name: 'Adobe Firefly' },
          },
        ]);
      }
    });
  });
});
