require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'expo-circular-reveal'
  s.version        = package['version']
  s.summary        = package['description']
  s.license        = { :type => 'MIT' }
  s.authors        = 'JuanRdBO'
  s.homepage       = 'https://github.com/JuanRdBO/expo-circular-reveal'
  s.platform       = :ios, '15.0'
  s.swift_version  = '5.4'
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{swift}'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
