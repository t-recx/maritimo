# frozen_string_literal: true

require "test_helper"
require "station"

describe Station do
  it "has a version number" do
    _(::Station::VERSION).wont_be_nil
  end

  describe :aplication do
    it "will create instance of Application" do
      _(Station.application).wont_be_nil
      _(Station.application).must_be_instance_of Station::Application
      _(Station.application.object_id).must_equal Station.application.object_id
    end
  end
end
