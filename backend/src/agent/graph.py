import os

from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]
from langchain_google_genai import (  # pyright: ignore[reportMissingImports]
    ChatGoogleGenerativeAI,  # pyright: ignore[reportMissingImports]
)
from langgraph.graph import MessageGraph  # pyright: ignore[reportMissingImports]
from langchain_core.messages import HumanMessage, AIMessage  # pyright: ignore[reportMissingImports]

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY 環境変数が設定されていません。")


llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", api_key=GEMINI_API_KEY)


# LLMの呼び出し
def call_llm(state: list) -> AIMessage:
    """LLMの呼び出し"""
    response = llm.invoke(state)
    return AIMessage(content=response.content)


def build_agent_graph():
    graph = MessageGraph()
    graph.add_node("llm_response", call_llm)
    graph.set_entry_point("llm_response")
    graph.set_finish_point("llm_response")
    return graph


agent_graph = build_agent_graph()
agent_executor = agent_graph.compile()
