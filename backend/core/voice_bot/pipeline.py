import asyncio
import os
from datetime import datetime

from core import logger
from core.voice_bot.db import get_database
from core.voice_bot.processors.frame_processors import GoodbyeDetector
from core.voice_bot.prompts.system import SYSTEM_PROMPT
from core.voice_bot.services.analytics import analyze_call_transcript
from core.voice_bot.tools.manager import ToolManager

log = logger(__name__)


async def run_bot(transport, stream_sid: str, call_sid: str):
    from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
    from pipecat.audio.vad.silero import SileroVADAnalyzer
    from pipecat.audio.vad.vad_analyzer import VADParams
    from pipecat.frames.frames import TextFrame
    from pipecat.pipeline.pipeline import Pipeline
    from pipecat.pipeline.runner import PipelineRunner
    from pipecat.pipeline.task import PipelineParams, PipelineTask
    from pipecat.processors.aggregators.llm_context import LLMContext
    from pipecat.processors.aggregators.llm_response_universal import (
        LLMContextAggregatorPair,
        LLMUserAggregatorParams,
    )
    from pipecat.services.deepgram.stt import DeepgramSTTService
    from pipecat.services.deepgram.tts import DeepgramTTSService
    from pipecat.services.groq.llm import GroqLLMService
    from pipecat.turns.user_stop import TurnAnalyzerUserTurnStopStrategy
    from pipecat.turns.user_turn_strategies import UserTurnStrategies

    stt = DeepgramSTTService(
        api_key=os.getenv("DEEPGRAM_API_KEY"),
    )
    tts = DeepgramTTSService(
        api_key=os.getenv("DEEPGRAM_API_KEY"),
        voice=os.getenv("DEEPGRAM_VOICE", "aura-asteria-en"),
    )
    llm = GroqLLMService(
        api_key=os.getenv("GROQ_API_KEY"),
        model=os.getenv("GROQ_REALTIME_MODEL", "llama-3.3-70b-versatile"),
    )

    context = LLMContext([{"role": "system", "content": SYSTEM_PROMPT}])
    user_agg, assistant_agg = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(
            user_turn_strategies=UserTurnStrategies(
                stop=[
                    TurnAnalyzerUserTurnStopStrategy(
                        turn_analyzer=LocalSmartTurnAnalyzerV3()
                    )
                ]
            ),
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.2)),
        ),
    )

    goodbye_detector = GoodbyeDetector()
    tool_manager = ToolManager(task=None, call_sid=call_sid)

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            goodbye_detector,
            user_agg,
            llm,
            tts,
            transport.output(),
            assistant_agg,
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            allow_interruptions=True,
            enable_metrics=True,
            enable_usage_metrics=True,
            audio_in_sample_rate=8000,
            audio_out_sample_rate=8000,
        ),
    )

    goodbye_detector.set_task(task)
    tool_manager.task = task

    for tool in [
        tool_manager.get_product_info,
        tool_manager.check_product_availability,
        tool_manager.search_web,
        tool_manager.capture_lead,
        tool_manager.end_call,
    ]:
        llm.register_direct_function(tool)

    @transport.event_handler("on_client_connected")
    async def on_client_connected(_transport, _client):
        await asyncio.sleep(1.5)
        await task.queue_frames(
            [
                TextFrame(
                    text="Hello! Welcome to Kvedaa, your premium source for cordyceps products. How can I help you today?"
                )
            ]
        )

    db = get_database()
    if db is not None:
        await db["calls"].insert_one(
            {
                "call_sid": call_sid,
                "stream_sid": stream_sid,
                "status": "started",
                "start_time": datetime.utcnow(),
            }
        )

    runner = PipelineRunner()
    await runner.run(task)

    transcript = _serialize_history(context.messages)
    analysis = await analyze_call_transcript(transcript)

    if db is not None:
        await db["calls"].update_one(
            {"call_sid": call_sid},
            {
                "$set": {
                    "status": "completed",
                    "end_time": datetime.utcnow(),
                    "transcript": transcript,
                    "analysis": analysis,
                }
            },
        )


def _serialize_history(data):
    if isinstance(data, dict):
        return {k: _serialize_history(v) for k, v in data.items()}
    if isinstance(data, list):
        return [_serialize_history(item) for item in data]
    if hasattr(data, "isoformat"):
        return data.isoformat()
    if hasattr(data, "__dict__"):
        return _serialize_history(data.__dict__)
    if isinstance(data, (str, int, float, bool, type(None))):
        return data
    return str(data)


async def bot(websocket, stream_sid: str, call_sid: str):
    from pipecat.serializers.twilio import TwilioFrameSerializer
    from pipecat.transports.websocket.fastapi import (
        FastAPIWebsocketParams,
        FastAPIWebsocketTransport,
    )

    serializer = TwilioFrameSerializer(
        stream_sid=stream_sid,
        call_sid=call_sid,
        account_sid=os.getenv("TWILIO_ACCOUNT_SID"),
        auth_token=os.getenv("TWILIO_AUTH_TOKEN"),
    )

    transport = FastAPIWebsocketTransport(
        websocket=websocket,
        params=FastAPIWebsocketParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            add_wav_header=False,
            serializer=serializer,
        ),
    )

    await run_bot(transport, stream_sid, call_sid)


# Trigger reload

# Trigger reload
