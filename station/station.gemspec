# frozen_string_literal: true

require_relative "lib/station/version"

Gem::Specification.new do |spec|
  spec.name = "station"
  spec.version = Station::VERSION
  spec.authors = ["João Bruno"]
  spec.email = ["hi@joaobruno.xyz"]

  spec.summary = "AIS station connector"
  spec.description = "AIS station connector"
  spec.homepage = "https://github.com/t-recx/maritimo"
  spec.required_ruby_version = ">= 2.6.0"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/t-recx/maritimo"

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (f == __FILE__) || f.match(%r{\A(?:(?:bin|test|spec|features)/|\.(?:git|travis|circleci)|appveyor)})
    end
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  # Uncomment to register a new dependency of your gem
  # spec.add_dependency "example-gem", "~> 1.0"

  spec.add_dependency "bunny", ">= 2.9.2"

  # For more information and examples about making a new gem, check out our
  # guide at: https://bundler.io/guides/creating_gem.html
end