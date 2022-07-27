require "logger"

module Station
  class Accumulator
    attr_reader :bag

    def initialize
      @bag = {}
    end

    def publish(queue, message, logger)
      tokens = message.strip.split("!", 2)

      return if tokens.length == 1 # invalid message (no '!' token)

      sentence_tokens = tokens.last.split ","

      fragment_count = Integer(sentence_tokens[1], exception: false)

      return if fragment_count.nil? # all messages must have a fragment count

      if fragment_count == 1
        queue.publish(message, persistent: true)

        logger.debug "Published message: #{message}"
      else
        ip = nil
        source_id = nil

        first_token = tokens.first

        if first_token.length > 0
          if first_token.include? "["
            ip = first_token.split("[").last

            ip = if ip.include? "]"
              ip.split("]").first
            end
          end

          if first_token.include? "s:"
            source_id = first_token.split("s:").last

            source_id = if source_id.include? ","
              source_id.split(",").first
            elsif source_id.include? "*"
              source_id.split("*").first
            end
          end
        end

        fragment_number = Integer(sentence_tokens[2], exception: false)
        message_id_string = sentence_tokens[3]
        message_id = Integer(message_id_string, exception: false)

        return if fragment_number.nil? || message_id.nil?

        hash_key = get_hash_key(ip, source_id, message_id_string)

        bag[hash_key] = [] unless bag[hash_key]

        if fragment_number > 1
          unless bag[hash_key][fragment_number - 1]
            logger.warn "Rejected sentences: No previous fragments found for message"

            bag.delete hash_key
            return
          end

          if bag[hash_key][fragment_number]
            logger.warn "Rejected sentences: Two sentences for same fragment id"
            bag.delete hash_key
            return
          end
        end

        bag[hash_key][fragment_number] = message

        if fragment_count == fragment_number
          if bag[hash_key].count { |x| x } == fragment_count
            composite_message = bag[hash_key].join("\n").strip

            queue.publish(composite_message, persistent: true)

            logger.debug "Published multi-sentence message: \n#{composite_message}"
          end

          bag.delete hash_key
        end
      end
    end

    def get_hash_key(ip, source_id, message_id)
      hash_key = ""

      if ip
        hash_key += ip
      end

      if source_id
        hash_key += "::" if hash_key.length > 0

        hash_key += source_id
      end

      if message_id
        hash_key += "::" if hash_key.length > 0

        hash_key += message_id
      end

      hash_key
    end
  end
end
