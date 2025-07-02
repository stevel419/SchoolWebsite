const puppeteer = require('puppeteer');

(async () => {
    const browserFetcher = puppeteer.createBrowserFetcher({
    path: process.env.PUPPETEER_CACHE_DIR || './.local-chromium',
    });
    const revision = puppeteer._preferredRevision;
    const info = await browserFetcher.download(revision);
    console.log('Chromium downloaded to:', info.executablePath);
})();