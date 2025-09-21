import { useEffect, useState, type FormEvent } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

interface Message {
  id: number;
  session_id: string;
  message: string;
  sender: "user" | "ai";
  timestamp: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const SESSION_ID = "sessionId";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>(
    localStorage.getItem(SESSION_ID) || `session-${Date.now()}`
  );

  // セッションIDを永続化
  useEffect(() => {
    localStorage.setItem(SESSION_ID, sessionId);
  }, [sessionId]);

  // チャット履歴のリロード
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/history/${sessionId}`);
        if (!response.ok) {
          throw new Error(
            `historyのリクエストが失敗しました。 status:${response.status}`
          );
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("メッセージの取得に失敗しました:", error);
      }
    };

    fetchHistory();
  }, [sessionId]); // sessionIdが変更されたら再ロード

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      session_id: sessionId,
      message: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.message,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `chatのリクエストが失敗しました。 status:${response.status}`
        );
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now() + 1, // 一時的なID
        session_id: sessionId,
        message: data.response,
        sender: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          session_id: sessionId,
          message: "エラーが発生しました。",
          sender: "ai",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <>
      <div className="App">
        <h1>Gemini LangGraph Chat</h1>

        <div className="chat-window">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <strong>{msg.sender === "user" ? "あなた" : "AI"}:</strong>{" "}
              {msg.message}
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
          />
          <button type="submit">送信</button>
        </form>

        <button
          onClick={() => {
            const newSessionId = `session-${Date.now()}`;
            setSessionId(newSessionId);
            setMessages([]); // 新しいセッションではメッセージをクリア
            localStorage.setItem(SESSION_ID, newSessionId);
          }}
        >
          新しいチャットを開始
        </button>
      </div>
    </>
  );
}

export default App;
