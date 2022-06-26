# frozen_string_literal: true

require_relative "station/version"
require_relative "station/application"
require_relative "station/udp_application"
require_relative "station/file_application"

module Station
  class << self
    def application
      @application ||= Station::Application.new
    end

    def udp_application
      @udp_application ||= Station::UDPApplication.new
    end

    def file_application
      @file_application ||= Station::FileApplication.new
    end
  end
end
