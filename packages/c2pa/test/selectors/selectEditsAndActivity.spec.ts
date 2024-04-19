import {
  createC2pa,
  Manifest,
  registerLocaleForEditsAndActivities,
  selectEditsAndActivity,
} from '../../';

interface TestContext {
  manifest: Manifest;
}

describe('selectEditsAndActivity', function () {
  describe('#selectEditsAndActivity', function () {
    describe('c2pa-actions-1.2.png', function () {
      beforeAll(async function (this: TestContext) {
        const c2pa = await createC2pa({
          wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
          workerSrc: './dist/c2pa.worker.js',
        });

        const result = await c2pa.read(
          './node_modules/@contentauth/testing/fixtures/images/c2pa-actions-1.2.png',
        );
        this.manifest = result.manifestStore?.activeManifest!;
      });

      describe('C2PA 1.2 actions metadata', function () {
        it('should handle embedded data correctly', async function (this: TestContext) {
          const result = await selectEditsAndActivity(this.manifest);

          expect(result?.length).toEqual(7);

          expect(result?.[0]?.id).toEqual(`c2pa.drawing`);
          expect(result?.[0]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/draw-dark.svg`,
          );
          expect(result?.[0]?.label).toEqual(`Drawing edits`);
          expect(result?.[0]?.description).toEqual(
            `Used tools like pencils, brushes, erasers, or shape, path, or pen tools`,
          );

          expect(result?.[1]?.id).toEqual(`c2pa.filtered`);
          expect(result?.[1]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/properties-dark.svg`,
          );
          expect(result?.[1]?.label).toEqual(`Filter or style edits`);
          expect(result?.[1]?.description).toEqual(
            `Used tools like filters, styles, or effects to change appearance`,
          );

          expect(result?.[2]?.id).toEqual(`c2pa.placed`);
          expect(result?.[2]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/save-to-light-dark.svg`,
          );
          expect(result?.[2]?.label).toEqual(`Imported`);
          expect(result?.[2]?.description).toEqual(
            `Added pre-existing content to this file`,
          );

          expect(result?.[3]?.id).toEqual(`c2pa.orientation`);
          expect(result?.[3]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/rotate-left-outline-dark.svg`,
          );
          expect(result?.[3]?.label).toEqual(`Orientation edits`);
          expect(result?.[3]?.description).toEqual(
            `Changed position or orientation (rotated, flipped, etc.)`,
          );

          expect(result?.[4]?.id).toEqual(`com.adobe.text`);
          expect(result?.[4]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/text-dark.svg`,
          );
          expect(result?.[4]?.label).toEqual(`Text edits`);
          expect(result?.[4]?.description).toEqual(
            `Created or made changes to text, including font family, color, or other styles`,
          );

          expect(result?.[5]?.id).toEqual(`c2pa.unknown`);
          expect(result?.[5]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/alert-circle-dark.svg`,
          );
          expect(result?.[5]?.label).toEqual(`Unknown edits or activity`);
          expect(result?.[5]?.description).toEqual(
            `Performed other edits or activity that couldn't be recognized`,
          );

          expect(result?.[6]?.id).toEqual(`com.adobe.animation_video`);
          expect(result?.[6]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/video-outline-dark.svg`,
          );
          expect(result?.[6]?.label).toEqual(`Video edits`);
          expect(result?.[6]?.description).toEqual(
            `Created or made changes to animation, audio, or other video properties`,
          );
        });

        it('should handle embedded translations with a match correctly', async function (this: TestContext) {
          const result = await selectEditsAndActivity(this.manifest, 'fr-FR');

          expect(result?.length).toEqual(7);

          expect(result?.[0]?.id).toEqual(`c2pa.placed`);
          expect(result?.[0]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/save-to-light-dark.svg`,
          );
          expect(result?.[0]?.label).toEqual(`Importé`);
          expect(result?.[0]?.description).toEqual(
            `Ajout du contenu préexistant à ce fichier`,
          );

          expect(result?.[1]?.id).toEqual(`c2pa.drawing`);
          expect(result?.[1]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/draw-dark.svg`,
          );
          expect(result?.[1]?.label).toEqual(`Modifications du dessin`);
          expect(result?.[1]?.description).toEqual(
            `Utilisation d’outils, comme des crayons, des pinceaux, des gommes ou des outils de forme, de tracé ou de plume`,
          );

          expect(result?.[2]?.id).toEqual(`c2pa.filtered`);
          expect(result?.[2]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/properties-dark.svg`,
          );
          expect(result?.[2]?.label).toEqual(
            `Modifications du filtre ou du style`,
          );
          expect(result?.[2]?.description).toEqual(
            `Utilisation d’outils tels que des filtres, des styles ou des effets pour modifier l’apparence`,
          );

          expect(result?.[3]?.id).toEqual(`com.adobe.text`);
          expect(result?.[3]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/text-dark.svg`,
          );
          expect(result?.[3]?.label).toEqual(`Modifications du texte`);
          expect(result?.[3]?.description).toEqual(
            `Création ou modification du texte, notamment de la famille de polices, de la couleur ou d’autres styles`,
          );

          expect(result?.[4]?.id).toEqual(`c2pa.unknown`);
          expect(result?.[4]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/alert-circle-dark.svg`,
          );
          expect(result?.[4]?.label).toEqual(
            `Modifications ou activité inconnues`,
          );
          expect(result?.[4]?.description).toEqual(
            `Réalisation d’autres modifications ou activités qui n’ont pas pu être reconnues`,
          );

          expect(result?.[5]?.id).toEqual(`com.adobe.animation_video`);
          expect(result?.[5]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/video-outline-dark.svg`,
          );
          expect(result?.[5]?.label).toEqual(`Modifications vidéo`);
          expect(result?.[5]?.description).toEqual(
            `Création ou modification de l’animation, de l’audio ou d’autres propriétés vidéo`,
          );

          expect(result?.[6]?.id).toEqual(`c2pa.orientation`);
          expect(result?.[6]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/rotate-left-outline-dark.svg`,
          );
          expect(result?.[6]?.label).toEqual(`Orientation Modifications de `);
          expect(result?.[6]?.description).toEqual(
            `Changement de position ou d’orientation (rotation, renversement, etc.)`,
          );
        });

        it('should handle embedded translations with a fallback correctly', async function (this: TestContext) {
          const result = await selectEditsAndActivity(this.manifest, 'ab-CD');

          expect(result?.length).toEqual(7);

          expect(result?.[0]?.id).toEqual(`c2pa.drawing`);
          expect(result?.[0]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/draw-dark.svg`,
          );
          expect(result?.[0]?.label).toEqual(`Drawing edits`);
          expect(result?.[0]?.description).toEqual(
            `Used tools like pencils, brushes, erasers, or shape, path, or pen tools`,
          );

          expect(result?.[1]?.id).toEqual(`c2pa.filtered`);
          expect(result?.[1]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/properties-dark.svg`,
          );
          expect(result?.[1]?.label).toEqual(`Filter or style edits`);
          expect(result?.[1]?.description).toEqual(
            `Used tools like filters, styles, or effects to change appearance`,
          );

          expect(result?.[2]?.id).toEqual(`c2pa.placed`);
          expect(result?.[2]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/save-to-light-dark.svg`,
          );
          expect(result?.[2]?.label).toEqual(`Imported`);
          expect(result?.[2]?.description).toEqual(
            `Added pre-existing content to this file`,
          );

          expect(result?.[3]?.id).toEqual(`c2pa.orientation`);
          expect(result?.[3]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/rotate-left-outline-dark.svg`,
          );
          expect(result?.[3]?.label).toEqual(`Orientation edits`);
          expect(result?.[3]?.description).toEqual(
            `Changed position or orientation (rotated, flipped, etc.)`,
          );

          expect(result?.[4]?.id).toEqual(`com.adobe.text`);
          expect(result?.[4]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/text-dark.svg`,
          );
          expect(result?.[4]?.label).toEqual(`Text edits`);
          expect(result?.[4]?.description).toEqual(
            `Created or made changes to text, including font family, color, or other styles`,
          );

          expect(result?.[5]?.id).toEqual(`c2pa.unknown`);
          expect(result?.[5]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/alert-circle-dark.svg`,
          );
          expect(result?.[5]?.label).toEqual(`Unknown edits or activity`);
          expect(result?.[5]?.description).toEqual(
            `Performed other edits or activity that couldn't be recognized`,
          );

          expect(result?.[6]?.id).toEqual(`com.adobe.animation_video`);
          expect(result?.[6]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/video-outline-dark.svg`,
          );
          expect(result?.[6]?.label).toEqual(`Video edits`);
          expect(result?.[6]?.description).toEqual(
            `Created or made changes to animation, audio, or other video properties`,
          );
        });

        it('should handle translations with a registered locale correctly', async function (this: TestContext) {
          registerLocaleForEditsAndActivities('ef-GH', {
            'selectors.editsAndActivity.c2pa.drawing.description': 'foo',
            'selectors.editsAndActivity.c2pa.drawing.label': 'foo',
            'selectors.editsAndActivity.c2pa.filtered.description': 'foo',
            'selectors.editsAndActivity.c2pa.filtered.label': 'foo',
            'selectors.editsAndActivity.c2pa.placed.description': 'foo',
            'selectors.editsAndActivity.c2pa.placed.label': 'foo',
            'selectors.editsAndActivity.c2pa.orientation.description': 'foo',
            'selectors.editsAndActivity.c2pa.orientation.label': 'foo',
            'selectors.editsAndActivity.c2pa.unknown.description': 'foo',
            'selectors.editsAndActivity.c2pa.unknown.label': 'foo',
          });

          const result = await selectEditsAndActivity(this.manifest, 'ef-GH');

          expect(result?.length).toEqual(7);

          expect(result?.[0]?.id).toEqual(`com.adobe.text`);
          expect(result?.[0]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/text-dark.svg`,
          );
          expect(result?.[0]?.label).toEqual(`Text edits`);
          expect(result?.[0]?.description).toEqual(
            `Created or made changes to text, including font family, color, or other styles`,
          );

          expect(result?.[1]?.id).toEqual(`com.adobe.animation_video`);
          expect(result?.[1]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/video-outline-dark.svg`,
          );
          expect(result?.[1]?.label).toEqual(`Video edits`);
          expect(result?.[1]?.description).toEqual(
            `Created or made changes to animation, audio, or other video properties`,
          );

          expect(result?.[2]?.id).toEqual(`c2pa.unknown`);
          expect(result?.[2]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/alert-circle-dark.svg`,
          );
          expect(result?.[2]?.label).toEqual(`foo`);
          expect(result?.[2]?.description).toEqual(`foo`);

          expect(result?.[3]?.id).toEqual(`c2pa.placed`);
          expect(result?.[3]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/save-to-light-dark.svg`,
          );
          expect(result?.[3]?.label).toEqual(`foo`);
          expect(result?.[3]?.description).toEqual(`foo`);

          expect(result?.[4]?.id).toEqual(`c2pa.drawing`);
          expect(result?.[4]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/draw-dark.svg`,
          );
          expect(result?.[4]?.label).toEqual(`foo`);
          expect(result?.[4]?.description).toEqual(`foo`);

          expect(result?.[5]?.id).toEqual(`c2pa.filtered`);
          expect(result?.[5]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/properties-dark.svg`,
          );
          expect(result?.[5]?.label).toEqual(`foo`);
          expect(result?.[5]?.description).toEqual(`foo`);

          expect(result?.[6]?.id).toEqual(`c2pa.orientation`);
          expect(result?.[6]?.icon).toEqual(
            `https://cai-assertions.adobe.com/icons/rotate-left-outline-dark.svg`,
          );
          expect(result?.[6]?.label).toEqual(`foo`);
          expect(result?.[6]?.description).toEqual(`foo`);
        });
      });
    });

    describe('firefly-1.jpg', function () {
      beforeAll(async function (this: TestContext) {
        const c2pa = await createC2pa({
          wasmSrc: './dist/assets/wasm/toolkit_bg.wasm',
          workerSrc: './dist/c2pa.worker.js',
        });

        const result = await c2pa.read(
          './node_modules/@contentauth/testing/fixtures/images/firefly-1.jpg',
        );
        this.manifest = result.manifestStore?.activeManifest!;
      });

      describe('C2PA 1.2 actions', function () {
        it('should handle fetching from built-in translations correctly (en-US)', async function (this: TestContext) {
          const result = await selectEditsAndActivity(this.manifest);

          expect(result?.length).toEqual(1);

          expect(result?.[0]?.id).toEqual(`c2pa.created`);
          expect(result?.[0]?.icon).toMatch(/^data:image\/svg\+xml,/);
          expect(result?.[0]?.label).toEqual(`Created`);
          expect(result?.[0]?.description).toEqual(
            `Created a new file or content`,
          );
        });

        it('should handle fetching from built-in translations correctly (fr-FR)', async function (this: TestContext) {
          const result = await selectEditsAndActivity(this.manifest, 'fr-FR');

          expect(result?.length).toEqual(1);

          expect(result?.[0]?.id).toEqual(`c2pa.created`);
          expect(result?.[0]?.icon).toMatch(/^data:image\/svg\+xml,/);
          expect(result?.[0]?.label).toEqual(`Créé`);
          expect(result?.[0]?.description).toEqual(
            `Création d’un nouveau fichier ou contenu`,
          );
        });
      });
    });
  });
});
