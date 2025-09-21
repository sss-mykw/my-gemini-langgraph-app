import logging
from typing import Any, Dict, List

from fastapi import FastAPI
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from src.agent.graph import agent_executor

app = FastAPI()

logger = logging.getLogger(__name__)  # モジュール単位の logger
logging.basicConfig(level=logging.INFO)  # デフォルト出力とレベル設定


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    intermediate_steps: List[Dict[str, Any]] = []


@app.get("/")
async def reed_root():
    return {"message": "Welcome to the Gemini LangGraph Backend!"}


@app.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    logger.info("User message: %s", request.message)

    user_input = [HumanMessage(content=request.message)]
    result = await agent_executor.ainvoke(user_input)
    logger.info("Raw result: %s", result)

    return ChatResponse(response=result[-1].content)
