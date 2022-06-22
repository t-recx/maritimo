require "socket"
require "bunny"

module Station
    class UDPApplication
        def initialize(udp_socket_factory = nil, connection_factory = nil, kernel = nil)
            @udp_socket_factory = udp_socket_factory || (->() { UDPSocket.new })
            @connection_factory = connection_factory || (->(bu) { Bunny.new bu })
            @kernel = kernel || Kernel
        end

        def run(port, broker_uri, queue_name)
            @kernel.puts "Creating UDP socket"
            socket = UDPSocket.new

            @kernel.puts "Binding socket to #{port}"
            socket.bind("0.0.0.0", port)

            @kernel.puts "Connecting to broker at #{broker_uri}"
            connection = @connection_factory.call broker_uri
            connection.start

            begin
                loop do
                    text, sender = socket.recv_from(1024 * 16)

                    while text.include? "\n"
                        tokens = text.split("\n", 2)

                        message = tokens.first
                        text = tokens.last

                        @kernel.puts "Received #{message}"

                        queue.publish(message, persistent: true)
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