import asyncio
import os
import platform
import sys

# Configure Windows asyncio event loop policy for subprocess support BEFORE uvicorn/fastapi initialization
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        loop="asyncio",
    )
