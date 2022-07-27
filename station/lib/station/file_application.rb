require "bunny"
require "logger"

module Station
  class FileApplication
    def initialize(connection_factory = nil, file = nil, accumulator = nil)
      @connection_factory = connection_factory || (->(bu) { Bunny.new bu })
      @file = file || File
      @accumulator = accumulator || Accumulator.new
    end

    def run(filename, broker_uri, queue_name, logger)
      logger.info "Connecting to broker at #{broker_uri}"
      connection = @connection_factory.call broker_uri
      connection.start

      begin
        logger.info "Creating queue: #{queue_name}"
        queue = connection.create_channel.queue(queue_name, durable: false)

        @file.foreach(filename) do |message|
          next if message.start_with? "#"

          logger.debug "Read message: #{message}"

          @accumulator.publish(queue, message.strip, logger)
        end
      rescue => e
        logger.error "Caught exception: #{e}"
      ensure
        logger.info "Closing broker connection"

        connection.close
      end
    end
  end
end
