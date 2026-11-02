#!/bin/sh
# Runs the accessibility UI tests on an iOS simulator.
#
# Usage: npm run test:a11y -- <simulator-udid>
#
# Requirements: the example app was built once for the simulator (`npm run ios`) and Metro is
# serving it on port 8090 (`npx expo start --port 8090 --localhost`), with the simulator
# pointed at it: `xcrun simctl spawn <udid> defaults write com.example.rnddoc RCT_jsLocation localhost:8090`.
# Use a phone-sized simulator: the demo document has several pages there and shows one at a time.
set -eu

UDID="${1:?usage: npm run test:a11y -- <simulator-udid>}"
cd "$(dirname "$0")/.."

export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
ruby uitests/add-ui-test-target.rb
cd ios
xcodebuild test \
  -workspace rndexample.xcworkspace \
  -scheme rndexampleA11yUITests \
  -sdk iphonesimulator \
  -destination "id=$UDID" \
  -configuration Debug \
  -derivedDataPath build
