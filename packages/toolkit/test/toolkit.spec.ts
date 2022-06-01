import { default as initToolkit } from '../pkg/toolkit';
import {
  itMatchesFixture,
  itMatchesValidation,
  loadTestData,
  TestContext,
} from './lib/manifest-store';

describe('@contentauth/toolkit', function () {
  beforeAll(async () => {
    await initToolkit('pkg/toolkit_bg.wasm');
  });

  describe('getManifestStoreFromArrayBuffer()', function () {
    describe('CAICAI.jpg', function (this: TestContext) {
      beforeAll(async function (this: TestContext) {
        ({ data: this.data, fixture: this.fixture } = await loadTestData(
          'CAICAI.jpg',
        ));
      });

      itMatchesFixture.call(this);
    });

    describe('CAIXCI.jpg', function (this: TestContext) {
      beforeAll(async function (this: TestContext) {
        ({ data: this.data, fixture: this.fixture } = await loadTestData(
          'CAIXCI.jpg',
        ));
      });

      itMatchesFixture.call(this);
    });

    describe('XCI.jpg', function (this: TestContext) {
      beforeAll(async function (this: TestContext) {
        ({ data: this.data, fixture: this.fixture } = await loadTestData(
          'XCI.jpg',
        ));
      });

      itMatchesFixture.call(this);
    });

    describe('I.jpg', function (this: TestContext) {
      it('should fail', async function (this: TestContext) {
        const expected = new Error('C2PA provenance not found in XMP');
        return expectAsync(loadTestData('I.jpg', false)).toBeRejectedWith(
          expected,
        );
      });
    });

    describe('E-prv-CA.jpg', function (this: TestContext) {
      it('should fail', async function (this: TestContext) {
        const expected = new Error('C2PA provenance not found in XMP');
        return expectAsync(
          loadTestData('E-prv-CA.jpg', false),
        ).toBeRejectedWith(expected);
      });
    });

    describe('E-sig-CA.jpg', function (this: TestContext) {
      beforeAll(async function (this: TestContext) {
        ({ data: this.data, fixture: this.fixture } = await loadTestData(
          'E-sig-CA.jpg',
        ));
      });

      itMatchesFixture.call(this);
    });

    describe('E-clm-CAICAI.jpg', function (this: TestContext) {
      beforeAll(async function (this: TestContext) {
        ({ data: this.data, fixture: this.fixture } = await loadTestData(
          'E-clm-CAICAI.jpg',
        ));
      });

      // NOTE: This is a validation-only call since c2patool doesn't show manifest data here
      itMatchesValidation.call(this);
    });

    describe('E-uri-CA.jpg', function (this: TestContext) {
      beforeAll(async function (this: TestContext) {
        ({ data: this.data, fixture: this.fixture } = await loadTestData(
          'E-uri-CA.jpg',
        ));
      });

      itMatchesFixture.call(this);
    });

    describe('E-uri-CIE-sig-CA.jpg', function (this: TestContext) {
      beforeAll(async function (this: TestContext) {
        ({ data: this.data, fixture: this.fixture } = await loadTestData(
          'E-uri-CIE-sig-CA.jpg',
        ));
      });

      itMatchesFixture.call(this);
    });

    describe('E-dat-CA.jpg', function (this: TestContext) {
      beforeAll(async function (this: TestContext) {
        ({ data: this.data, fixture: this.fixture } = await loadTestData(
          'E-dat-CA.jpg',
        ));
      });

      itMatchesFixture.call(this);
    });
  });
});
