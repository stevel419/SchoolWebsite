#!/bin/bash

export PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer

PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
npx puppeteer browsers install chrome@138.0.7204.92