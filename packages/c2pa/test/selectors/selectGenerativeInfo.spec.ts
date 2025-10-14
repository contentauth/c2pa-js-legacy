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
            assertion: { label: 'c2pa.actions.v2', data: jasmine.any(Object) },
            action: {
              action: 'c2pa.placed',
              digitalSourceType:
                'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
              parameters: jasmine.any(Object),
              softwareAgent: 'Adobe Firefly',
            },
            type: 'trainedAlgorithmicMedia',
            softwareAgent: 'Adobe Firefly',
          },
          {
            assertion: { label: 'c2pa.actions.v2', data: jasmine.any(Object) },
            action: {
              action: 'c2pa.placed',
              digitalSourceType:
                'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
              parameters: jasmine.any(Object),
              softwareAgent: 'Adobe Firefly',
            },
            type: 'trainedAlgorithmicMedia',
            softwareAgent: 'Adobe Firefly',
          },
          {
            assertion: {
              label: 'c2pa.actions.v2',
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
            softwareAgent: 'Adobe Firefly',
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

    it('should look up parameters details in assertion', async function (this: TestContext) {
      const manifest = {
        label: 'urn:uuid:05f3b244-301a-49c4-ae14-c24bec024002',
        title: 'An image for tests',
        format: 'image/png',
        vendor: null,
        claimGenerator: 'c2pa-js unit tests',
        claimGeneratorHints: null,
        claimGeneratorInfo: [],
        instanceId: 'xmp:iid:12fe9a47-8ad3-4ad1-b362-2ff987428e03',
        signatureInfo: {
          alg: 'Ps256',
          issuer: 'Unit tests',
          cert_serial_number: '11111',
          time: '2025-03-31T13:36:22+00:00',
        },
        credentials: [],
        ingredients: [
          {
            title: 'An Image',
            format: 'image/png',
            documentId: null,
            instanceId: 'xmp:iid:52cc660c-8de9-472e-9441-810749fc4514',
            provenance: null,
            hash: null,
            isParent: true,
            validationStatus: [],
            metadata: null,
            manifest: null,
            thumbnail: {
              blob: {},
              contentType: 'image/jpeg',
            },
          },
        ],
        redactions: [],
        parent: null,
        thumbnail: null,
        assertions: {
          data: [
            {
              label: 'c2pa.actions',
              data: {
                actions: [
                  {
                    action: 'c2pa.opened',
                    parameters: {
                      'com.adobe.details': 'the-other-model-name',
                      'com.adobe.digitalSourceType':
                        'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
                      ingredient: {
                        url: 'self#jumbf=c2pa.assertions/c2pa.ingredient',
                        hash: [1, 2, 3],
                      },
                      'com.adobe.type': 'remoteProvider.3rdParty',
                    },
                  },
                ],
              },
            },
          ],
        },
        verifiedIdentities: [],
      };

      expect(manifest).not.toBeNull();
      if (manifest) {
        const genAssertions = selectGenerativeInfo(manifest);
        const expectedResult = [
          {
            assertion: {
              label: 'c2pa.actions',
              data: {
                actions: [
                  {
                    action: 'c2pa.opened',
                    parameters: {
                      'com.adobe.details': 'the-other-model-name',
                      'com.adobe.digitalSourceType':
                        'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
                      ingredient: {
                        url: 'self#jumbf=c2pa.assertions/c2pa.ingredient',
                        hash: [1, 2, 3],
                      },
                      'com.adobe.type': 'remoteProvider.3rdParty',
                    },
                  },
                ],
              },
            },
            action: {
              action: 'c2pa.opened',
              parameters: {
                'com.adobe.details': 'the-other-model-name',
                'com.adobe.digitalSourceType':
                  'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',
                ingredient: {
                  url: 'self#jumbf=c2pa.assertions/c2pa.ingredient',
                  hash: [1, 2, 3],
                },
                'com.adobe.type': 'remoteProvider.3rdParty',
              },
            },
            type: 'trainedAlgorithmicMedia',
            softwareAgent: {
              name: 'the-other-model-name',
            },
          },
        ];
        expect(genAssertions).toEqual(expectedResult);
      }
    });
  });
});
