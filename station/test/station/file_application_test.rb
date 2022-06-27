require "test_helper"
require "station"
require "fakes"

include Station

describe FileApplication do
  let(:input) { "" }
  let(:file) do
    @file_instance ||= FakeFile.new

    @file_instance.input = input

    @file_instance
  end
  let(:connection_factory) { ->(bu) { @connection ||= FakeBunny.new bu } }
  let(:kernel) { FakeKernel.new }

  let(:broker_uri) { "amqp://test.org:5043" }
  let(:queue_name) { "station_queue" }
  let(:filename) { "dump.txt" }

  subject { FileApplication.new connection_factory, kernel, file }

  describe :run do
    it "should create a connection with appropriate parameters" do
      exercise_run

      _(@connection.broker_uri).must_equal broker_uri
    end

    it "should create a channel on connection" do
      exercise_run

      _(@connection.create_channel_called).must_equal true
    end

    it "should call queue on channel with appropriate parameters" do
      exercise_run

      _(@connection.channel.queue_called).must_equal true
      _(@connection.channel.queue_name).must_equal queue_name
      _(@connection.channel.opts[:durable]).must_equal true
    end

    it "should close connection" do
      exercise_run

      _(@connection.closed_called).must_equal true
    end

    describe "when file has content" do
      let(:input) { "ONE\nTWO\nA\nB\n" }

      it "should be read and published" do
        exercise_run

        _(@connection.channel.fake_queue.published).must_equal [
          ["ONE", {persistent: true}],
          ["TWO", {persistent: true}],
          ["A", {persistent: true}],
          ["B", {persistent: true}]
        ]
        _(@file_instance.filename).must_equal filename
      end
    end
  end

  def exercise_run
    subject.run filename, broker_uri, queue_name
  end
end