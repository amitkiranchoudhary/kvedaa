import asyncio
import re

from pipecat.processors.frame_processor import FrameProcessor

from core import logger

log = logger(__name__)


class GoodbyeDetector(FrameProcessor):
    """Detects goodbye phrases and automatically terminates the call."""

    GOODBYE_PATTERNS = [
        r"\b(goodbye|bye|good bye|bye bye)\b",
        r"\b(thanks|thank you|thankyou)\s*(bye|goodbye)?\b",
        r"\b(not interested|no thanks|no thank you)\b",
    ]

    def __init__(self, task=None, **kwargs):
        super().__init__(**kwargs)
        self.task = task
        self.call_ended = False
        self.compiled_patterns = [
            re.compile(pattern, re.IGNORECASE) for pattern in self.GOODBYE_PATTERNS
        ]

    def set_task(self, task):
        self.task = task

    async def process_frame(self, frame, direction):
        await super().process_frame(frame, direction)
        from pipecat.frames.frames import TranscriptionFrame, TextFrame, EndFrame

        # Only check transcription frames from the user
        if isinstance(frame, TranscriptionFrame) and not self.call_ended:
            text = frame.text.lower().strip()
            # Check if any goodbye pattern matches
            for pattern in self.compiled_patterns:
                if pattern.search(text):
                    log.info(f"🛑 GOODBYE DETECTED: '{text}' - Terminating call!")
                    self.call_ended = True

                    if self.task:
                        await self.task.queue_frames([
                            TextFrame(text="Thank you for your time. Have a great day! Goodbye.")
                        ])
                        await asyncio.sleep(1.5)
                        await self.task.queue_frames([EndFrame()])
                    break

        # Pass the frame along the pipeline
        await self.push_frame(frame, direction)

