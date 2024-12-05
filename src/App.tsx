import { useEffect, useState } from "react";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { AIMessageChunk } from "@langchain/core/messages";
import "./App.css";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const model = new ChatOpenAI({ model: "gpt-4", apiKey: API_KEY });
const messages = [
  new SystemMessage("Translate the following from English to Italian"),
  new HumanMessage("Goodbye my dear friend")
];

function App() {
  const [response, setResponse] = useState<AIMessageChunk | null>(null);

  useEffect(() => {
    const invoke = async () => {
      const responseData = await model.invoke(messages);

      if (!responseData) {
        throw new Error("No response from model");
      }

      setResponse(responseData);
    };

    invoke();
  }, []);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        {typeof response?.content === "string" && <p>{response?.content}</p>}
      </div>
    </>
  );
}

export default App;
