require "test_helper"
require "station"

include Station

describe Accumulator do
  let(:queue) { FakeQueue.new }
  let(:prefix) { nil }

  subject { Accumulator.new }

  describe :publish do
    describe "when messages are of a single-sentence type" do
      let(:messages) {
        [
          "!AIVDM,1,1,,A,13sO4ugP00OF8;nF8V:TBwvB00S<,0*22",
          "!AIVDM,1,1,,B,402Pe?1uvT>r?OGIuvF`ECA00<2M,0*6C",
          "!AIVDM,1,1,,B,402PeD1uvT>rMOF:=@EwURA00HAg,0*51",
          "!AIVDM,1,1,,A,4000<@iuvT>s0wEeK4F8@`7000S:,0*05"
        ]
      }

      it "should publish them immediately" do
        exercise_immediate_publish
      end

      describe "and when messages include sender's ip address" do
        let(:prefix) { "[203.30.11.89]" }

        it "should publish them immediately" do
          exercise_immediate_publish
        end
      end

      describe "and when messages include station's id" do
        let(:prefix) { "\\s:2034,t:403*99\\" }

        it "should publish them immediately" do
          exercise_immediate_publish
        end
      end

      describe "and when messages include both the sender's ip address and the station's id" do
        let(:prefix) { "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]\\t:3044,s:STX-49303*23" }

        it "should publish them immediately" do
          exercise_immediate_publish
        end
      end
    end
  end

  def exercise_immediate_publish
    last_count = 0

    messages.each do |message|
      message = prefix + message if prefix

      subject.publish queue, message

      _(queue.published.last).must_equal([message, persistent: true])
      _(queue.published.length).must_equal(last_count + 1)

      last_count = queue.published.length
    end
  end
end
