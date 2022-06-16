require "test_helper"
require "station"

include Station

describe Application do
  let(:tcp_data_sent) { [] }
  let(:tcp_socket_factory) do
    lambda { |h, port|
      @tcp_socket ||= FakeTcpSocket.new h, port

      @tcp_socket.sent = tcp_data_sent

      @tcp_socket
    }
  end
  let(:connection_factory) { ->(bu) { @connection ||= FakeBunny.new bu } }
  let(:kernel) { FakeKernel.new }

  let(:host) { "203.23.12.3" }
  let(:port) { 3500 }
  let(:broker_uri) { "amqp://test.org:5043" }
  let(:queue_name) { "station_queue" }
  let(:read_timeout_seconds) { 5 }

  subject { Application.new tcp_socket_factory, connection_factory, kernel }

  describe :run do
    it "should create a socket with appropriate parameters" do
      exercise_run

      _(@tcp_socket.host).must_equal host
      _(@tcp_socket.port).must_equal port
    end

    it "should wait the specified time for socket to be readable before timing out" do
      exercise_run

      _(@tcp_socket.wait_readable_seconds).must_equal read_timeout_seconds
    end

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

    it "should close socket" do
      exercise_run

      _(@tcp_socket.closed_called).must_equal true
    end

    describe "when socket returns values" do
      let(:tcp_data_sent) { ["ONE\nTWO\nTH", "REE\nUNFINISHED"] }

      it "should be received and published" do
        exercise_run

        _(@connection.channel.fake_queue.published).must_equal [
          ["ONE", {persistent: true}],
          ["TWO", {persistent: true}],
          ["THREE", {persistent: true}]
        ]
      end
    end
  end

  def exercise_run
    subject.run host, port, broker_uri, queue_name, read_timeout_seconds
  end
end

class FakeTcpSocket
  attr_accessor :host, :port, :sent, :sent_index, :closed_called, :wait_readable_seconds

  def initialize(host, port)
    @host = host
    @port = port
    @sent = []
    @sent_index = 0
    @closed_called = false
    @wait_readable_seconds = 0
  end

  def read_nonblock bytes
    return_value = @sent[@sent_index]

    @sent_index += 1

    raise Errno::EAGAIN unless return_value

    return_value
  end

  def wait_readable seconds
    @wait_readable_seconds = seconds
    false
  end

  def close
    @closed_called = true
  end
end

class FakeBunny
  attr_accessor :broker_uri, :start_called, :create_channel_called, :channel, :closed_called

  def initialize(broker_uri)
    @broker_uri = broker_uri
    @channel = FakeChannel.new
    @start_called = false
    @create_channel_called = false
    @closed_called = false
  end

  def start
    @start_called = true
  end

  def create_channel
    @create_channel_called = true

    @channel
  end

  def close
    @closed_called = true
  end
end

class FakeChannel
  attr_accessor :queue_name, :opts, :queue_called, :fake_queue

  def initialize
    @fake_queue = FakeQueue.new
    @queue_called = false
  end

  def queue(queue_name, opts = {})
    @queue_called = true
    @queue_name = queue_name
    @opts = opts

    @fake_queue
  end
end

class FakeQueue
  attr_accessor :published

  def initialize
    @published = []
  end

  def publish(pstr, opts = {})
    @published.push [pstr, opts]
  end
end

class FakeKernel
  def puts(pstr = "")
  end
end
