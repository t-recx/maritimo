# frozen_string_literal: true

require_relative "station/version"
require_relative "station/application"

module Station
  class << self
    def application
      @application ||= Station::Application.new
    end
  end
end
