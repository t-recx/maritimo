require "socket"
require "bunny"
require "timeout"
require "logger"

module Station
  class Application
    def initialize(tcp_socket_factory = nil, connection_factory = nil, accumulator = nil)
      @tcp_socket_factory = tcp_socket_factory || (->(h, port) { TCPSocket.new h, port })
      @connection_factory = connection_factory || (->(bu) { Bunny.new bu })
      @accumulator = accumulator || Accumulator.new
    end

    def run(host, port, broker_uri, queue_name, read_timeout_seconds, include_ip_address, logger)
      logger.info "Connecting to socket at #{host}:#{port}"
      socket = @tcp_socket_factory.call host, port

      logger.info "Connecting to broker at #{broker_uri}"
      connection = @connection_factory.call broker_uri
      connection.start

      begin
        logger.info "Creating queue #{queue_name}"
        queue = connection.create_channel.queue(queue_name, durable: true)

        acc = ""

        loop do
          acc += socket.read_nonblock(1024 * 16)

          while acc.include? "\n"
            tokens = acc.split("\n", 2)

            message = tokens.first
            acc = tokens.last

            logger.debug "Received message from #{host}: #{message}"

            message = "[#{host}]#{message}" if include_ip_address

            @accumulator.publish(queue, message, logger)
          end
        rescue Errno::EAGAIN
          if socket.wait_readable(read_timeout_seconds)
            retry
          else
            logger.error "Connection timed out"
            raise Timeout::Error
          end
        end
      rescue => e
        logger.error "Caught exception: #{e}"
      ensure
        logger.info "Closing broker connection"

        connection.close

        logger.info "Closing socket connection"

        socket.close
      end
    end
  end
end
