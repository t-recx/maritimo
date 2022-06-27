require "test_helper"
require "station"

include Station

describe Accumulator do
  let(:queue) { FakeQueue.new }
  let(:kernel) { FakeKernel.new }
  let(:prefix) { nil }

  subject { Accumulator.new kernel }

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

    describe "when messages are of multi-sentence type" do
      it "should only be sent when completed" do
        subject.publish queue, "!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"
        _(queue.published.length).must_equal(0)
        _(subject.bag.length).must_equal(1)
        subject.publish queue, "!AIVDM,2,2,6,B,H8888888880,2*51"
        _(queue.published.length).must_equal(1) # all sentences from a message must be sent on the same package
        _(subject.bag.length).must_equal(0)
        _(queue.published.first[0]).must_equal("!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C\n!AIVDM,2,2,6,B,H8888888880,2*51")
      end

      describe "and when messages include sender's ip address" do
        let(:prefix) { "[203.30.11.89]" }

        it "should only be sent when completed" do
          subject.publish queue, "!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"
          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(1)
          subject.publish queue, "!AIVDM,2,2,6,B,H8888888880,2*51"
          _(queue.published.length).must_equal(1) # all sentences from a message must be sent on the same package
          _(subject.bag.length).must_equal(0)
          _(queue.published.first[0]).must_equal("!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C\n!AIVDM,2,2,6,B,H8888888880,2*51")
        end
      end

      describe "and when messages include station's id" do
        let(:prefix) { "\\s:2034,t:403*99\\" }

        it "should only be sent when completed" do
          subject.publish queue, "!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"
          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(1)
          subject.publish queue, "!AIVDM,2,2,6,B,H8888888880,2*51"
          _(queue.published.length).must_equal(1) # all sentences from a message must be sent on the same package
          _(subject.bag.length).must_equal(0)
          _(queue.published.first[0]).must_equal("!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C\n!AIVDM,2,2,6,B,H8888888880,2*51")
        end
      end

      describe "and when messages include both the sender's ip address and the station's id" do
        let(:prefix) { "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]\\t:3044,s:STX-49303*23" }

        it "should only be sent when completed" do
          subject.publish queue, "!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"
          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(1)
          subject.publish queue, "!AIVDM,2,2,6,B,H8888888880,2*51"
          _(queue.published.length).must_equal(1) # all sentences from a message must be sent on the same package
          _(subject.bag.length).must_equal(0)
          _(queue.published.first[0]).must_equal("!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C\n!AIVDM,2,2,6,B,H8888888880,2*51")
        end
      end

      describe "and when sending messages with various mixes of ip, source id or both" do
        it "should only be sent when completed - test case #1" do
          subject.publish queue, "!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"
          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(1)
          subject.publish queue, "[100.29.29.1]!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"
          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(2)
          subject.publish queue, "\\s:203*22\\!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"
          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(3)
          subject.publish queue, "!AIVDM,2,2,6,B,H8888888880,2*51"
          _(queue.published.length).must_equal(1) # all sentences from a message must be sent on the same package
          _(subject.bag.length).must_equal(2)
          _(queue.published[0][0]).must_equal("!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C\n!AIVDM,2,2,6,B,H8888888880,2*51")
          subject.publish queue, "\\s:203*22\\!AIVDM,2,2,6,B,H8888888880,2*51"
          _(queue.published.length).must_equal(2) # all sentences from a message must be sent on the same package
          _(subject.bag.length).must_equal(1)
          _(queue.published[1][0]).must_equal("\\s:203*22\\!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C\n\\s:203*22\\!AIVDM,2,2,6,B,H8888888880,2*51")
          subject.publish queue, "[100.29.29.1]!AIVDM,2,2,6,B,H8888888880,2*51"
          _(subject.bag.length).must_equal(0)
          _(queue.published.length).must_equal(3) # all sentences from a message must be sent on the same package
          _(queue.published[2][0]).must_equal("[100.29.29.1]!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C\n[100.29.29.1]!AIVDM,2,2,6,B,H8888888880,2*51")
        end

        it "should only be sent when completed - test case #2" do
          subject.publish queue, "!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"

          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(1)

          subject.publish queue, "!AIVDM,2,1,7,A,54R?P2029SIAK8@6221LUA@Dp8E8LDr2222222169`;496T40>0PDTQBDSp8,0*65"

          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(2)

          subject.publish queue, "[100.100.2.2]!AIVDM,2,2,6,B,H8888888880,2*51" # should be discarded, since it starts on fragment = 2

          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(2)

          subject.publish queue, "[2.1.1.2]!AIVDM,2,1,8,B,53sO7A02Bu:@=<L;:21<4<u:0TV222222222221@7P?9540Ht00000000000,0*04"

          _(queue.published.length).must_equal(0)
          _(subject.bag.length).must_equal(3)

          subject.publish queue, "!AIVDM,2,2,6,B,H8888888880,2*51"

          _(queue.published.length).must_equal(1)
          _(subject.bag.length).must_equal(2)

          subject.publish queue, "[2.1.1.2]!AIVDM,2,2,8,B,00000000000,2*2F"

          _(queue.published.length).must_equal(2)
          _(subject.bag.length).must_equal(1)

          subject.publish queue, "\\s:200*00\\!AIVDM,2,2,7,A,88888888880,2*23"

          _(queue.published.length).must_equal(2)
          _(subject.bag.length).must_equal(1)

          subject.publish queue, "\\t:43298,s:4039,x:34043*00\\!AIVDM,2,1,1,A,53btkN02>8da0P@6220DhU@F2222222222222217AH::<6D60@T532Dp8888,0*2A"

          _(queue.published.length).must_equal(2)
          _(subject.bag.length).must_equal(2)

          subject.publish queue, "\\t:43298,s:4039,x:34043*00\\!AIVDM,2,2,1,A,88888888880,2*25"

          _(queue.published.length).must_equal(3)
          _(subject.bag.length).must_equal(1)

          subject.publish queue, "!AIVDM,2,2,7,A,88888888880,2*23"

          _(queue.published.length).must_equal(4)
          _(subject.bag.length).must_equal(0)
        end
      end
    end

    describe "when message is sent starting from the middle of the sentence" do
      it "should not be stored nor published" do
        subject.publish queue, "!AIVDM,3,2,7,A,88888888880,2*23"

        _(queue.published.length).must_equal(0)
        _(subject.bag.length).must_equal(0)

        subject.publish queue, "!AIVDM,3,3,7,A,88888888880,2*23"

        _(queue.published.length).must_equal(0)
        _(subject.bag.length).must_equal(0)
      end
    end

    describe "when message fragment is sent and when there was already a stored fragment for the message" do
      it "should not be stored nor published - test case #1" do
        subject.publish queue, "!AIVDM,3,1,7,A,88888888880,2*23"

        _(queue.published.length).must_equal(0)
        _(subject.bag.length).must_equal(1)

        subject.publish queue, "!AIVDM,3,1,7,A,88888888880,2*23" # First message: reset it

        _(queue.published.length).must_equal(0)
        _(subject.bag.length).must_equal(1)

        subject.publish queue, "!AIVDM,3,2,7,A,88888888880,2*23"

        _(queue.published.length).must_equal(0)
        _(subject.bag.length).must_equal(1)

        subject.publish queue, "!AIVDM,3,2,7,A,88888888880,2*23"

        _(queue.published.length).must_equal(0)
        _(subject.bag.length).must_equal(0)
      end
    end

    describe "when messages are invalid" do
      it "should be discarded" do
        subject.publish queue, "!AIVDM,1,1,,A,13sO4ugP00OF8;nF8V:TBwvB00S<,0*22"
        subject.publish queue, "INVALID MESSAGE"
        subject.publish queue, "!AIVDM,2,1,6,B,533>H`42;mh@=<8f220IE8p5>22222222222221?<@25=6V;0B4;`11C1hA0,0*3C"
        subject.publish queue, "!INVALID,MESSAGE,xxx,1,fdjsfkljdsklfjdsklj"
        subject.publish queue, "[3043.324.243249.3423]\\s:34892094*22\\vxnmore,1,1,2,B,fkdjfskjdskfj,2*99"
        subject.publish queue, "!AIVDM,2,2,6,B,H8888888880,2*51"
        subject.publish queue, "430294fkdjsjeqcdnms dfkjs fdsncdksn !AIVDM fkdljsfljdsvn"
        subject.publish queue, "!AIVDM,,,,B,H8888888880,2*51"
        subject.publish queue, "!AIVDM,,1,1,B,H8888888880,2*51"

        _(queue.published.length).must_equal(2)
        _(subject.bag.length).must_equal(0)
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
