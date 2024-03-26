import { C2paReadResult, createC2pa } from '../';

interface TestContext {
  result: C2paReadResult;
}

describe('c2pa', function () {
  describe('file support', function () {
    it('should read AVIs', async function () {
      const c2pa = await createC2pa({
        wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
        workerSrc: './dist/c2pa.worker.js',
      });

      const result = await c2pa.read(
        './node_modules/@contentauth/testing/fixtures/images/sample.avi',
      );

      expect(result.manifestStore).not.toBeNull();
    });

    it('should read PDFs', async function () {
      const c2pa = await createC2pa({
        wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
        workerSrc: './dist/c2pa.worker.js',
      });

      const result = await c2pa.read(
        './node_modules/@contentauth/testing/fixtures/images/sample.pdf',
      );

      expect(result.manifestStore).not.toBeNull();
    });
  });

  describe('#read', function () {
    describe('CAICAI.jpg', function () {
      beforeAll(async function (this: TestContext) {
        const c2pa = await createC2pa({
          wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
          workerSrc: './dist/c2pa.worker.js',
        });

        this.result = await c2pa.read(
          './node_modules/@contentauth/testing/fixtures/images/CAICAI.jpg',
        );
      });

      describe('manifestStore', function () {
        describe('validationStatus', function () {
          it('should include the correct validation errors', function (this: TestContext) {
            expect(this.result.manifestStore?.validationStatus).toEqual([
              {
                code: 'signingCredential.invalid',
                url: 'Cose_Sign1',
                explanation:
                  'certificate issuer and subject cannot be the same {self-signed disallowed}',
              },
              {
                code: 'claimSignature.mismatch',
                url: 'self#jumbf=/c2pa/adobetest:urn:uuid:825cf3cf-0127-4af3-b65c-c11d0f961e67/c2pa.signature',
                explanation: 'claim signature is not valid',
              },
            ]);
          });
        });

        describe('activeManifest', function () {
          it('should have the correct data', function (this: TestContext) {
            const activeManifest = this.result.manifestStore?.activeManifest;

            expect(activeManifest?.title).toBe('CAICAI.jpg');
            expect(activeManifest?.format).toBe('image/jpeg');
            expect(activeManifest?.vendor).toBeNull();
            expect(activeManifest?.claimGenerator).toBe('C2PA Testing');
            expect(activeManifest?.claimGeneratorHints).toBeNull();
            expect(activeManifest?.instanceId).toBe(
              'xmp:iid:8dc9aa07-6920-40b7-b6bc-0638b8414141',
            );
            expect(activeManifest?.signatureInfo).toEqual({
              cert_serial_number:
                '625534260363177462480876791874889527700529350752',
              issuer: 'Adobe, Inc.',
              time: '2022-04-20T22:44:41+00:00',
            });
            expect(activeManifest?.credentials).toEqual([
              {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                credentialSubject: {
                  id: 'did:adobe:f78db44b3d758bbf1ac2b1da23d6a9bc8d4554bbc7ca6f78f5536d6cf813d218e',
                  name: 'Gavin Peacock',
                },
                id: 'did:adobe:f78db44b3d758bbf1ac2b1da23d6a9bc8d4554bbc7ca6f78f5536d6cf813d218e',
                proof: {
                  created: '2022-01-06T05:40:52.737829354Z',
                  proof_purpose: 'Ed25519Signature2018',
                  proof_type: 'Ed25519Signature2018',
                  proof_value:
                    'f7d0ded35fcbf3d63078c4fe729460a67ea4c78a1cce073c2f8d3277b96f02caf373fcd4dd67b8c9c94c1e4f48f43d0ac9a4294a2aa06a64aafa574323da11403',
                  verification_method:
                    'did:adobe:f78db44b3d758bbf1ac2b1da23d6a9bc8d4554bbc7ca6f78f5536d6cf813d218e',
                },
                type: ['VerifiableCredential'],
              },
            ]);
            expect(activeManifest?.redactions).toEqual([]);
            expect(activeManifest?.parent).toBeNull();
          });

          it('should contain the correct ingredients', function (this: TestContext) {
            const ingredients =
              this.result.manifestStore?.activeManifest?.ingredients!;

            expect(ingredients[0].title).toBe('CA.jpg');
            expect(ingredients[0].format).toBe('image/jpeg');
            expect(ingredients[0].documentId).toBeNull();
            expect(ingredients[0].instanceId).toBe(
              'xmp:iid:4eff2e25-acda-4e1f-b3c3-b08729f3b540',
            );
            expect(ingredients[0].provenance).toBeNull();
            expect(ingredients[0].hash).toBeNull();
            expect(ingredients[0].isParent).toBe(true);
            expect(ingredients[0].validationStatus).toEqual([]);
            expect(ingredients[0].metadata).toBeNull();
            expect(ingredients[0].manifest?.title).toBe('CA.jpg');

            expect(ingredients[1].title).toBe('CAI.jpg');
            expect(ingredients[1].format).toBe('image/jpeg');
            expect(ingredients[1].documentId).toBeNull();
            expect(ingredients[1].instanceId).toBe(
              'xmp:iid:4f66b468-ec33-47bd-87aa-7faa279ab025',
            );
            expect(ingredients[1].provenance).toBeNull();
            expect(ingredients[1].hash).toBeNull();
            expect(ingredients[1].isParent).toBe(false);
            expect(ingredients[1].validationStatus).toEqual([]);
            expect(ingredients[1].metadata).toBeNull();
            expect(ingredients[1].manifest?.title).toBe('CAI.jpg');
          });

          it('should have a thumbnail that can be disposed', async function (this: TestContext) {
            const activeManifest = this.result.manifestStore?.activeManifest;

            expect(activeManifest?.thumbnail).toEqual({
              blob: jasmine.any(Blob),
              contentType: 'image/jpeg',
              getUrl: jasmine.any(Function),
              hash: jasmine.any(Function),
            });

            const thumbnail = activeManifest?.thumbnail?.getUrl();

            const thumbnailRes = await fetch(thumbnail!.url);

            expect(thumbnailRes.ok).toBe(true);

            thumbnail?.dispose();

            await expectAsync(fetch(thumbnail!.url)).toBeRejected();
          });
        });

        it('should have the correct manifest chain', function (this: TestContext) {
          const manifestStore = this.result.manifestStore;

          const ingredientManifests =
            manifestStore?.activeManifest.ingredients?.map(
              (ingredient) => ingredient.manifest,
            );

          ingredientManifests?.forEach((ingredientManifest) => {
            expect(ingredientManifest?.parent).toBe(
              manifestStore?.activeManifest,
            );
          });

          expect(manifestStore?.activeManifest.parent).toBeNull();
        });

        describe('ingredients', function () {
          it('should be correct', function (this: TestContext) {
            const ingredients =
              this.result.manifestStore?.activeManifest?.ingredients!;

            expect(ingredients[0].title).toBe('CA.jpg');
            expect(ingredients[0].format).toBe('image/jpeg');
            expect(ingredients[0].documentId).toBeNull();
            expect(ingredients[0].instanceId).toBe(
              'xmp:iid:4eff2e25-acda-4e1f-b3c3-b08729f3b540',
            );
            expect(ingredients[0].provenance).toBeNull();
            expect(ingredients[0].hash).toBeNull();
            expect(ingredients[0].isParent).toBe(true);
            expect(ingredients[0].validationStatus).toEqual([]);
            expect(ingredients[0].metadata).toBeNull();
            expect(ingredients[0].manifest?.title).toBe('CA.jpg');

            expect(ingredients[1].title).toBe('CAI.jpg');
            expect(ingredients[1].format).toBe('image/jpeg');
            expect(ingredients[1].documentId).toBeNull();
            expect(ingredients[1].instanceId).toBe(
              'xmp:iid:4f66b468-ec33-47bd-87aa-7faa279ab025',
            );
            expect(ingredients[1].provenance).toBeNull();
            expect(ingredients[1].hash).toBeNull();
            expect(ingredients[1].isParent).toBe(false);
            expect(ingredients[1].validationStatus).toEqual([]);
            expect(ingredients[1].metadata).toBeNull();
            expect(ingredients[1].manifest?.title).toBe('CAI.jpg');
          });
        });
      });

      describe('assertions', function () {
        describe('data', function () {
          it("should contain the manifest's assertions", function (this: TestContext) {
            const { assertions } = this.result.manifestStore?.activeManifest!;

            expect(assertions.data).toEqual([
              {
                label: 'adobe.beta',
                data: { version: '0.12.5' },
              },
              {
                label: 'stds.schema-org.CreativeWork',
                data: {
                  '@context': 'http://schema.org/',
                  '@type': 'CreativeWork',
                  author: jasmine.any(Array),
                },
                kind: 'Json',
              },
              {
                label: 'c2pa.actions',
                data: { actions: jasmine.any(Array) },
              },
              {
                label: 'adobe.dictionary',
                data: {
                  url: 'https://cai-assertions.adobe.com/photoshop/dictionary.json',
                },
              },
            ] as any);
          });
        });

        describe('#get', function () {
          it('should return the requested assertion', function (this: TestContext) {
            const { assertions } = this.result.manifestStore?.activeManifest!;
            expect(assertions.get('c2pa.actions')).toEqual([
              {
                label: 'c2pa.actions',
                data: {
                  actions: jasmine.any(Array),
                },
              },
            ]);
          });
        });
      });

      describe('source', function () {
        it('should be returned', function (this: TestContext) {
          expect(this.result.source).toEqual({
            metadata: { filename: 'CAICAI.jpg' },
            type: 'image/jpeg',
            blob: jasmine.any(Blob),
            arrayBuffer: jasmine.any(Function),
            thumbnail: jasmine.any(Object),
          });
        });
      });
    });

    describe('cloud manifests', function () {
      beforeAll(async function () {
        const c2pa = await createC2pa({
          wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
          workerSrc: './dist/c2pa.worker.js',
        });

        this.result = await c2pa.read(
          './node_modules/@contentauth/testing/fixtures/images/cloud.jpg',
        );
      });

      it('should be fetched and validated', async function (this: TestContext) {
        const c2pa = await createC2pa({
          wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
          workerSrc: './dist/c2pa.worker.js',
        });

        const result = await c2pa.read(
          './node_modules/@contentauth/testing/fixtures/images/cloud.jpg',
        );

        expect(result.manifestStore).not.toBeNull();
        expect(result.manifestStore?.validationStatus).toEqual([]);
      });

      it('should not be fetched when fetchRemoteManifests is false', async function () {
        const c2pa = await createC2pa({
          wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
          workerSrc: './dist/c2pa.worker.js',
          fetchRemoteManifests: false,
        });

        const result = await c2pa.read(
          './node_modules/@contentauth/testing/fixtures/images/cloud.jpg',
        );

        expect(result.manifestStore).toBeNull();
      });
    });
  });
});
