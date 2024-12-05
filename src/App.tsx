import { useState } from "react";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import languages from "./data/languages.json";
import Loader from "./components/Loader";

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
    <main className="grid gap-4 py-9 px-4">
      <h1 className="text-xl text-center">Language Translator</h1>
      <form
        onSubmit={handleSubmit}
        className="grid text-center place-items-center gap-4"
      >
        <label htmlFor="language-select" className="sr-only">
          Choose a pet:
        </label>

        <select
          name="language-select"
          id="language-select"
          required
          className="px-4 py-2 border rounded "
        >
          <option value="">Please choose a language to translate to</option>
          <option value="afrikaans">Afrikaans</option>
          {languages
            ?.sort((a, b) => a.localeCompare(b))
            ?.map((language) => (
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
          className="px-4 py-2"
        />
        <button
          type="submit"
          className={`bg-purple-500 px-4 py-2 rounded border text-white hover:bg-purple-600 transition-colors ${
            isLoading ? "opacity-50 cursor-wait" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Translating..." : "Translate"}
        </button>
      </form>
      {isLoading && <Loader />}
      <div className="text-center">
        {response && !isLoading && (
          <p className="text-lg py-4 px-12 bg-purple-200 border rounded">
            {response}
          </p>
        )}
      </div>
    </main>
  );
}

export default App;
