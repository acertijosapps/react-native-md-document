require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'react-native-md-document'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.authors      = { 'Venteks' => 'noreply@venteks.dev' }
  s.homepage     = 'https://gitlab.com/acertijoslibs/rndocument'
  s.platforms    = { :ios => '13.0' }
  s.source       = { :git => 'https://gitlab.com/acertijoslibs/rndocument.git', :tag => s.version.to_s }
  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.swift_version = '5.0'
  s.dependency 'React-Core'
end
