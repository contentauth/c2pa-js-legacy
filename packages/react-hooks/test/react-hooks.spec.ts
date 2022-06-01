import { renderHook } from '@contentauth/testing';
import wrapper from './lib/test-wrapper';
import { useC2pa } from '../';

describe('react-hooks', () => {
  describe('useC2pa', () => {
    it('should return provenance data', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () =>
          useC2pa(
            './node_modules/@contentauth/testing/fixtures/images/CAICAI.jpg',
          ),
        { wrapper },
      );

      await waitForNextUpdate();

      expect(result.current).toBeDefined();
    });
  });
});
