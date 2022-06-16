require "socket"
require "bunny"
require "timeout"

module Station
  class Application
    def initialize(tcp_socket_factory = nil, connection_factory = nil, kernel = nil)
      @tcp_socket_factory = tcp_socket_factory || (->(h, port) { TCPSocket.new h, port })
      @connection_factory = connection_factory || (->(bu) { Bunny.new bu })
      @kernel = kernel || Kernel
    end

    def run(host, port, broker_uri, queue_name, read_timeout_seconds)
      @kernel.puts "Connecting to socket at #{host}:#{port}"
      socket = @tcp_socket_factory.call host, port

      @kernel.puts "Connecting to broker at #{broker_uri}"
      connection = @connection_factory.call broker_uri
      connection.start

      begin
        @kernel.puts "Creating queue #{queue_name}"
        queue = connection.create_channel.queue(queue_name, durable: true)

        acc = ""

        loop do
          acc += socket.read_nonblock(1024 * 16)

          while acc.include? "\n"
            tokens = acc.split("\n", 2)

            message = tokens.first
            acc = tokens.last

            @kernel.puts "Received #{message}"

            queue.publish(message, persistent: true)
          end
        rescue Errno::EAGAIN
          if socket.wait_readable(read_timeout_seconds)
            retry
          else
            @kernel.puts "Connection timed out"
            raise Timeout::Error
          end
        end
      rescue => e
        @kernel.puts "Caught exception: #{e}"
      ensure
        @kernel.puts "Closing broker connection"

        connection.close

        @kernel.puts "Closing socket connection"

        socket.close
      end
    end
  end
end
