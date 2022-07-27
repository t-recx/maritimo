module Station
  class NilLogger
    attr_accessor :level

    def debug(progname = nil, &block)
    end

    def info(progname = nil, &block)
    end

    def warn(progname = nil, &block)
    end

    def error(progname = nil, &block)
    end

    def fatal(progname = nil, &block)
    end

    def unknown(progname = nil, &block)
    end
  end
end
