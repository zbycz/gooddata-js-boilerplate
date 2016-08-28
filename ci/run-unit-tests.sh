#!/bin/bash -x

echo "Running tests with Karma..."

. $(dirname $0)/lib.sh

PATH=$PATH:/opt/npm/node_modules/.bin:./node_modules/.bin
export CHROME_BIN="/usr/bin/chromium-browser"

grunt test --ci
