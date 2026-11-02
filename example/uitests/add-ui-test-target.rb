# Adds the accessibility UI test target to the generated iOS project (example/ios is
# produced by `expo prebuild` and is not versioned). Safe to run more than once.
require 'xcodeproj'

TARGET_NAME = 'rndexampleA11yUITests'
ROOT = File.expand_path('..', __dir__)
PROJECT_PATH = File.join(ROOT, 'ios', 'rndexample.xcodeproj')

project = Xcodeproj::Project.open(PROJECT_PATH)
app_target = project.targets.find { |t| t.name == 'rndexample' } or abort('app target not found')
target = project.targets.find { |t| t.name == TARGET_NAME }

unless target
  target = project.new_target(:ui_test_bundle, TARGET_NAME, :ios, '15.1')
  target.add_dependency(app_target)
  group = project.main_group.new_group(TARGET_NAME, File.join(ROOT, 'uitests'))
  ref = group.new_file('A11yUITests.swift')
  target.add_file_references([ref])
  target.build_configurations.each do |config|
    config.build_settings['PRODUCT_NAME'] = '$(TARGET_NAME)'
    config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.example.rnddoc.a11yuitests'
    config.build_settings['TEST_TARGET_NAME'] = 'rndexample'
    config.build_settings['GENERATE_INFOPLIST_FILE'] = 'YES'
    config.build_settings['SWIFT_VERSION'] = '5.0'
    config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
    config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
  end
  project.save
end

scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app_target)
scheme.add_test_target(target)
scheme.set_launch_target(app_target)
scheme.save_as(PROJECT_PATH, TARGET_NAME, true)
puts "Configured #{TARGET_NAME}"
