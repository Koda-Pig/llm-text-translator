import { useState } from "react";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import languages from "./data/languages.json";
import "./App.css";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const model = new ChatOpenAI({ model: "gpt-4", apiKey: API_KEY });
const parser = new StringOutputParser();

function App() {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(e.currentTarget);
    const userMessage = formData.get("message");
    const selectedLanguage = formData.get("language-select");

    if (!userMessage || typeof userMessage !== "string") {
      setResponse("Please type a message to translate");
      return;
    }

    setIsLoading(true);

    try {
      const messages = [
        new SystemMessage(
          `Translate the following from English to ${selectedLanguage}`
        ),
        new HumanMessage(userMessage)
      ];

      const responseData = await model.invoke(messages);

      if (!responseData) {
        setResponse("No response from the model");
        return;
      }

      const parsedResponse = await parser.invoke(responseData);

      if (!parsedResponse) {
        setResponse("No response from the parser");
        return;
      }

      setResponse(parsedResponse);
    } catch (error) {
      console.error(error);
      setResponse("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  return (
    <>
      <h1>LLM text translate</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="language-select" className="sr-only">
          Choose a pet:
        </label>

        <select name="language-select" id="language-select" required>
          <option value="">Please choose a language to translate to</option>
          <option value="afrikaans">Afrikaans</option>
          {languages?.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>

        <label htmlFor="message" className="sr-only">
          Type your message
        </label>
        <input
          type="text"
          name="message"
          id="message"
          required
          placeholder="type your message here"
        />
        <button type="submit">Translate</button>
      </form>
      {isLoading && <p>Loading...</p>}
      <div className="card">{response && !isLoading && <p>{response}</p>}</div>
    </>
  );
}

export default App;
