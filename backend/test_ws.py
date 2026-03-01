import asyncio
import websockets

async def test():
    try:
        ws = await websockets.connect(
            'wss://frightened-jackie-overremissly.ngrok-free.dev/ws',
            additional_headers={'ngrok-skip-browser-warning': 'true'}
        )
        print('WebSocket connected successfully!')
        await ws.close()
    except Exception as e:
        print(f'WebSocket connection failed: {type(e).__name__}: {e}')

asyncio.run(test())
