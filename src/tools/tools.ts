import { tool, type InferToolInput, type InferToolOutput } from "ai";
import { z } from "zod";
import Replicate from "replicate";

const replicate = new Replicate();

export const generateImage = tool({
  name: "generateImage",
  description: "Tool that generates images",
  inputSchema: z.object({
    prompt: z.string().describe("the prompt of the user"),
  }),
  execute: async ({ prompt }) => {
    const input = { prompt, output_format: "jpg" };
    const output: any = await replicate.run("google/nano-banana", { input });
    const url:string = output?.url() as string;
    return url;
  },
});

export const updateImage = tool({
  name: "updateImage",
  description: "Tool that Edits images",
  inputSchema: z.object({
    prompt: z.string().describe("the prompt of the user"),
    images:z.array(z.object({image:z.string()})) ,
  }),
  execute: async ({ prompt,images }) => {
    const input = { prompt,input:images, output_format: "jpg" };
    const output: any = await replicate.run("google/nano-banana", { input });
    const url:string = output?.url() as string;

    return url;
  },
});

export type GenerateImageInput = InferToolInput<typeof generateImage>;
export type GenerateImageOutput = InferToolOutput<typeof generateImage>;

export type UpdateImageInput = InferToolInput<typeof updateImage>;
export type UpdateImageOutput = InferToolOutput<typeof updateImage>;

export const tools = {
  generateImage,
  updateImage
} 
