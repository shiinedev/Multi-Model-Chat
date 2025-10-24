import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createProviderRegistry} from "ai";

export const registry = createProviderRegistry({
  openai,
  google,
});


const model = registry.languageModel("openai:gpt-4.1-nano")