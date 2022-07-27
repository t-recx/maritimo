require "socket"
require "bunny"
require "logger"

module Station
  class UDPApplication
    def initialize(udp_socket_factory = nil, connection_factory = nil, accumulator = nil)
      @udp_socket_factory = udp_socket_factory || (-> { UDPSocket.new })
      @connection_factory = connection_factory || (->(bu) { Bunny.new bu })
      @accumulator = accumulator || Accumulator.new
    end

    def run(port, broker_uri, queue_name, include_ip_address, logger)
      logger.info "Creating UDP socket"
      socket = @udp_socket_factory.call

      logger.info "Binding socket to #{port}"
      socket.bind("0.0.0.0", port)

      logger.info "Connecting to broker at #{broker_uri}"
      connection = @connection_factory.call broker_uri
      connection.start

      begin
        logger.info "Creating queue #{queue_name}"
        queue = connection.create_channel.queue(queue_name, durable: false)

        loop do
          text, sender = socket.recvfrom(1024 * 16)

          while text.include? "\n"
            tokens = text.split("\n", 2)

            message = tokens.first
            text = tokens.last

            logger.debug "Received message from #{sender[3]}: #{message}"

            message = "[#{sender[3]}]#{message}" if include_ip_address

            @accumulator.publish(queue, message, logger)
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
