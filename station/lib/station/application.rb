require "socket"
require "bunny"

module Station
  class Application
    def initialize(tcp_socket_factory = nil, connection_factory = nil, kernel = nil)
      @tcp_socket_factory = tcp_socket_factory || (->(h, p) { TCPSocket.new h, p })
      @connection_factory = connection_factory || (->(bu) { Bunny.new bu })
      @kernel = kernel || Kernel
    end

    def run(host, port, broker_uri, queue_name)
      socket = @tcp_socket_factory.call host, port

      connection = @connection_factory.call broker_uri
      connection.start

      queue = connection.create_channel.queue(queue_name, durable: true)

      while (line = socket.gets)
        @kernel.puts "Received #{line}"

        queue.publish(line.strip, persistent: true)
      end

      connection.close

      socket.close
    end
  end
end
