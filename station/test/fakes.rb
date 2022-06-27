class FakeAccumulator
  attr_accessor :published

  def initialize
    @published = []
  end

  def publish queue, message
    @published.push({queue: queue, message: message})
  end
end

class FakeFile
  attr_accessor :input, :filename

  def initialize
    @input = ""
  end

  def foreach(filename)
    @filename = filename

    @input.lines.each do |line|
      yield line
    end
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

class FakeUdpSocket
  attr_accessor :binded_host, :binded_port, :received, :received_index, :closed_called

  def initialize
    @received = []
    @received_index = 0
    @closed_called = false
  end

  def bind(host, port)
    @binded_host = host
    @binded_port = port
  end

  def recvfrom bytes
    return_value = @received[@received_index]

    @received_index += 1

    raise unless return_value

    return_value
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
