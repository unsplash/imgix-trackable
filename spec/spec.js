describe("imgixTrackable", function() {
  const imgixTrackable = require('../lib');

  describe("when the URL has no params", function() {
    const baseUrl = 'https://images.unsplash.com/photo-123'

    it("should add the ixid param", function() {
      const trackedUrl = imgixTrackable(baseUrl, { app: 'my-app' });

      expect(trackedUrl).toContain('?ixid=');
    });
  });
});
