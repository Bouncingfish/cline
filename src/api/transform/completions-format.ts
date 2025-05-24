import { Anthropic } from "@anthropic-ai/sdk"

/**
 * Converts Anthropic messages and system prompt to a single prompt string
 * for OpenAI's completions API (used by models like Codex)
 */
export function convertToCompletionsPrompt(
	systemPrompt: string,
	messages: Anthropic.Messages.MessageParam[]
): string {
	let prompt = systemPrompt + "\n\n"

	for (const message of messages) {
		if (message.role === "user") {
			prompt += "Human: "
			if (Array.isArray(message.content)) {
				// Handle mixed content (text + images)
				for (const content of message.content) {
					if (content.type === "text") {
						prompt += content.text
					} else if (content.type === "image") {
						// For completions API, we can describe the image or skip it
						// since most completion models don't support images
						prompt += "[Image provided]"
					}
				}
			} else {
				prompt += message.content
			}
			prompt += "\n\n"
		} else if (message.role === "assistant") {
			prompt += "Assistant: "
			if (Array.isArray(message.content)) {
				for (const content of message.content) {
					if (content.type === "text") {
						prompt += content.text
					} else if (content.type === "tool_use") {
						// Convert tool use to a descriptive text
						prompt += `[Tool: ${content.name}(${JSON.stringify(content.input)})]`
					}
				}
			} else {
				prompt += message.content
			}
			prompt += "\n\n"
		}
		// Skip tool_result messages as they're handled in context
	}

	// Add prompt for assistant to continue
	prompt += "Assistant: "

	return prompt
}