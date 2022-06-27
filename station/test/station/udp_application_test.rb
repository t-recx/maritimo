require "test_helper"
require "station"
require "fakes"

include Station

describe UDPApplication do
  let(:udp_data_received) { [] }
  let(:udp_socket_factory) do
    lambda {
      @udp_socket ||= FakeUdpSocket.new

      @udp_socket.received = udp_data_received

      @udp_socket
    }
  end
  let(:connection_factory) { ->(bu) { @connection ||= FakeBunny.new bu } }
  let(:kernel) { FakeKernel.new }
  let(:accumulator) { FakeAccumulator.new }

  let(:port) { 3500 }
  let(:broker_uri) { "amqp://test.org:5043" }
  let(:queue_name) { "station_queue" }
  let(:include_ip_address) { false }
  let(:queue) { @connection.channel.fake_queue }

  subject { UDPApplication.new udp_socket_factory, connection_factory, kernel, accumulator }

  describe :run do
    it "should create a socket" do
      exercise_run

      _(@udp_socket).wont_be_nil
    end

    it "should bind socket to port" do
      exercise_run

      _(@udp_socket.binded_host).must_equal "0.0.0.0"
      _(@udp_socket.binded_port).must_equal port
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

      _(@udp_socket.closed_called).must_equal true
    end

    describe "when socket returns values" do
      let(:udp_data_received) { [["ONE\nTWO\n", [nil, nil, nil, "230.49.12.3"]], ["A\nB\n", [nil, nil, nil, "174.2.44.1"]]] }

      describe "and when configured to include ip address" do
        let(:include_ip_address) { true }

        it "should be received and published with the source's ip address" do
          exercise_run

          _(accumulator.published).must_equal [
            {message: "[230.49.12.3]ONE", queue: queue},
            {message: "[230.49.12.3]TWO", queue: queue},
            {message: "[174.2.44.1]A", queue: queue},
            {message: "[174.2.44.1]B", queue: queue}
          ]
        end
      end

      it "should be received and published" do
        exercise_run

        _(accumulator.published).must_equal [
          {message: "ONE", queue: queue},
          {message: "TWO", queue: queue},
          {message: "A", queue: queue},
          {message: "B", queue: queue}
        ]
      end
    end
  end

  def exercise_run
    subject.run port, broker_uri, queue_name, include_ip_address
  end
end
