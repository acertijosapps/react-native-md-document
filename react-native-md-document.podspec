require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'react-native-md-document'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.authors      = { 'AcertijosApps' => 'acertijos.contacto@gmail.com' }
  s.homepage     = 'https://acertijosapps.com/librerias/react-native-md-document'
  s.platforms    = { :ios => '13.0' }
  s.source       = { :git => 'https://github.com/acertijosapps/react-native-md-document.git', :tag => "v#{s.version}" }
  s.source_files = 'ios/**/*.{h,m,mm,swift}'
  s.swift_version = '5.0'
  s.dependency 'React-Core'
end
