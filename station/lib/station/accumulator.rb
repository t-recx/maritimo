module Station
  class Accumulator
    def publish(queue, message)
      queue.publish(message, persistent: true)
    end
  end
end
