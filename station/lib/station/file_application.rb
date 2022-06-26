require "bunny"

module Station
  class FileApplication
    def initialize(connection_factory = nil, kernel = nil, file = nil)
      @connection_factory = connection_factory || (->(bu) { Bunny.new bu })
      @kernel = kernel || Kernel
      @file = file || File
    end

    def run(filename, broker_uri, queue_name)
      @kernel.puts "Connecting to broker at #{broker_uri}"
      connection = @connection_factory.call broker_uri
      connection.start

      begin
        @kernel.puts "Creating queue: #{queue_name}"
        queue = connection.create_channel.queue(queue_name, durable: true)

        @file.foreach(filename) do |message|
          next if message.start_with? "#"

          @kernel.puts "Read message: #{message}"

          queue.publish(message.strip, persistent: true)
        end
      rescue => e
        @kernel.puts "Caught exception: #{e}"
      ensure
        @kernel.puts "Closing broker connection"

        connection.close
      end
    end
  end
end
