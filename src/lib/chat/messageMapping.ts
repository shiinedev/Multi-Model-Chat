import { MyDBUIMessagePart,MyDBUIMessagePartSelect } from "@/db/schema";
import { MyUIMessagePart } from "./types";


export const mapUIMessagePartsToDBParts = (
  messageParts: MyUIMessagePart[],
  messageId: string,
): MyDBUIMessagePart[] => {
  return messageParts.map((part, index) => {
    switch (part.type) {
      case "text":
        return {
          messageId,
          order: index,
          type: part.type,
          text: part.text,
        };
      case "reasoning":
        return {
          messageId,
          order: index,
          type: part.type,
          reasoning_text: part.text,
          providerMetadata: part.providerMetadata,
        };
      case "file":
        return {
          messageId,
          order: index,
          type: part.type,
          file_mediaType: part.mediaType,
          file_filename: part.filename,
          file_url: part.url,
        };
      case "source-document":
        return {
          messageId,
          order: index,
          type: part.type,
          source_document_sourceId: part.sourceId,
          source_document_mediaType: part.mediaType,
          source_document_title: part.title,
          source_document_filename: part.filename,
          providerMetadata: part.providerMetadata,
        };
      case "source-url":
        return {
          messageId,
          order: index,
          type: part.type,
          source_url_sourceId: part.sourceId,
          source_url_url: part.url,
          source_url_title: part.title,
          providerMetadata: part.providerMetadata,
        };
      case "step-start":
        return {
          messageId,
          order: index,
          type: part.type,
        };
      case "tool-generateImage":
        return {
          messageId,
          order: index,
          type: part.type,
          tool_toolCallId: part.toolCallId,
          tool_state: part.state,
         tool_generateImage_input:
            part.state === "input-available" ||
            part.state === "output-available" ||
            part.state === "output-error"
              ? part.input
              : undefined,
          tool_generateImage_output:
            part.state === "output-available" ? part.output : undefined,
          tool_generateImage_errorText:
            part.state === "output-error" ? part.errorText : undefined,
        };
      case "tool-updateImage":
        return {
          messageId,
          order: index,
          type: part.type,
          tool_toolCallId: part.toolCallId,
          tool_state: part.state,
          tool_updateImage_input:
            part.state === "input-available" ||
            part.state === "output-available" ||
            part.state === "output-error"
              ? part.input
              : undefined,
          tool_updateImage_output:
            part.state === "output-available" ? part.output : undefined,
          tool_updateImage_errorText:
            part.state === "output-error" ? part.errorText : undefined,
        };
      default:
        throw new Error(`Unsupported part type: ${part}`);
    }
  });
};

export const mapDBPartToUIMessagePart = (
  part: MyDBUIMessagePartSelect,
): MyUIMessagePart => {
  switch (part.type) {
    case "text":
      return {
        type: part.type,
        text: part.text!,
      };
    case "reasoning":
      return {
        type: part.type,
        text: part.reasoning_text!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "file":
      return {
        type: part.type,
        mediaType: part.file_mediaType!,
        filename: part.file_filename!,
        url: part.file_url!,
      };
    case "source-document":
      return {
        type: part.type,
        sourceId: part.source_document_sourceId!,
        mediaType: part.source_document_mediaType!,
        title: part.source_document_title!,
        filename: part.source_document_filename!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "source-url":
      return {
        type: part.type,
        sourceId: part.source_url_sourceId!,
        url: part.source_url_url!,
        title: part.source_url_title!,
        providerMetadata: part.providerMetadata ?? undefined,
      };
    case "step-start":
      return {
        type: part.type,
      };
    case "tool-generateImage":
      if (!part.tool_state) {
        throw new Error("generateImage_state is undefined");
      }
      switch (part.tool_state) {
        case "input-streaming":
          return {
            type: "tool-generateImage",
            state: "input-streaming",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_generateImage_Input!,
          };
        case "input-available":
          return {
            type: "tool-generateImage",
            state: "input-available",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_generateImage_Input!,
          };
        case "output-available":
          return {
            type: "tool-generateImage",
            state: "output-available",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_generateImage_Input!,
            output: part.tool_generateImage_output!,
          };
        case "output-error":
          return {
            type: "tool-generateImage",
            state: "output-error",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_generateImage_Input!,
            errorText: part.tool_errorText!,
          };
      }
    case "tool-updateImage":
      if (!part.tool_state) {
        throw new Error("updateImage_state is undefined");
      }
      switch (part.tool_state) {
        case "input-streaming":
          return {
            type: "tool-updateImage",
            state: "input-streaming",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_updateImage_Input!,
          };
        case "input-available":
          return {
            type: "tool-updateImage",
            state: "input-available",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_updateImage_Input!,
          };
        case "output-available":
          return {
            type: "tool-updateImage",
            state: "output-available",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_updateImage_Input!,
            output: part.tool_updateImage_output!,
          };
        case "output-error":
          return {
            type: "tool-updateImage",
            state: "output-error",
            toolCallId: part.tool_toolCallId!,
            input: part.tool_updateImage_Input!,
            errorText: part.tool_errorText!,
          };
      }
    default:
      throw new Error(`Unsupported part type: ${part.type}`);
  }
};