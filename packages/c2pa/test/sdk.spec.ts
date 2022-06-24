import {
  createC2pa,
  C2paReadResult,
  GetManifestType,
  resolvers,
  GetIngredientType,
} from '../';

const manifestResolvers = resolvers.createTypedResolvers({
  customResolver: (manifest) => manifest.data.assertions.length,
  ...resolvers.editsAndActivity,
});

type Result = C2paReadResult<typeof manifestResolvers>;
type Manifest = GetManifestType<Result>;
type Ingredient = GetIngredientType<Result>;

interface TestContext {
  result: Result;
}

describe('c2pa', function () {
  describe('#read', function () {
    describe('CAICAI.jpg', function () {
      beforeAll(async function (this: TestContext) {
        const c2pa = await createC2pa({
          wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
          workerSrc: './dist/c2pa.worker.js',

          manifestResolvers,
        });

        this.result = await c2pa.read(
          './node_modules/@contentauth/testing/fixtures/images/CAICAI.jpg',
        );
      });

      describe('manifestStore', function () {
        describe('activeManifest', function () {
          it('should have the correct active manifest', function (this: TestContext) {
            const activeManifest = this.result.manifestStore?.activeManifest;

            expect(activeManifest?.claimGenerator).toEqual({
              value: 'C2PA Testing',
              product: 'C2PA Testing',
            });

            expect(activeManifest?.format).toBe('image/jpeg');

            expect(activeManifest?.parent).toBeUndefined();

            expect(activeManifest?.producer).toEqual({
              '@type': 'Person',
              credential: [
                {
                  alg: 'sha256',
                  hash: jasmine.any(Array),
                  url: 'self#jumbf=/c2pa/adobetest:urn:uuid:825cf3cf-0127-4af3-b65c-c11d0f961e67/c2pa.credentials/did:adobe:f78db44b3d758bbf1ac2b1da23d6a9bc8d4554bbc7ca6f78f5536d6cf813d218e',
                },
              ],
              identifier:
                'did:adobe:f78db44b3d758bbf1ac2b1da23d6a9bc8d4554bbc7ca6f78f5536d6cf813d218e',
              name: 'Gavin Peacock',
            });

            expect(activeManifest?.signature).toEqual({
              date: jasmine.any(Date),
              isoDateString: '2022-04-20T22:44:41+00:00',
              issuer: 'Adobe, Inc.',
            });

            expect(activeManifest?.socialAccounts).toEqual([
              {
                '@id': 'https://www.twitter.com/gvnpeacock',
                '@type': 'Person',
                identifier:
                  'https://cai-identity.adobe.io/identities/did:adobe:f78db44b3d758bbf1ac2b1da23d6a9bc8d4554bbc7ca6f78f5536d6cf813d218e?service=VerifiableCredentials',
                name: 'gvnpeacock',
              },
            ]);

            expect(activeManifest?.title).toBe('CAICAI.jpg');
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

            const thumbnailRes = await fetch(thumbnail!.data.url);

            expect(thumbnailRes.ok).toBe(true);

            thumbnail?.dispose();

            await expectAsync(fetch(thumbnail!.data.url)).toBeRejected();
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

          expect(manifestStore?.activeManifest.parent).toBeUndefined();
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
  });
});
