/**
 * Apel comun către /api/webhook/chat — folosit de AssistantPopup și pagina de căutare.
 */
export async function fetchAssistantReply(message, sessionId, options = {}) {
  const { signal } = options;
  const response = await fetch("/api/webhook/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
    signal,
  });

  const contentType = response.headers.get("content-type");
  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = `Eroare ${response.status}: ${response.statusText}`;
    if (contentType && contentType.includes("application/json") && responseText) {
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
    } else if (responseText) {
      errorMessage = responseText.substring(0, 200);
    }
    throw new Error(errorMessage);
  }

  if (!responseText || responseText.trim().length === 0) {
    throw new Error("Serverul a returnat un răspuns gol.");
  }

  let aiText;
  if (contentType && contentType.includes("application/json")) {
    try {
      const data = JSON.parse(responseText);
      if (typeof data === "string") {
        aiText = data;
      } else if (Array.isArray(data)) {
        if (data.length > 0) {
          const firstItem = data[0];
          aiText =
            firstItem.message ||
            firstItem.reply ||
            firstItem.output ||
            firstItem.text ||
            firstItem.response ||
            firstItem.answer ||
            (typeof firstItem === "string" ? firstItem : String(firstItem));
        } else {
          aiText = "(Răspunsul nu a putut fi preluat - array gol)";
        }
      } else if (typeof data === "object" && data !== null) {
        aiText =
          data.message ||
          data.reply ||
          data.output ||
          data.text ||
          data.response ||
          data.answer ||
          (data.json && (data.json.message || data.json.output)) ||
          "(Răspunsul nu a putut fi preluat)";
      } else {
        aiText = String(data);
      }
    } catch {
      aiText = responseText;
    }
  } else {
    aiText = responseText;
  }

  return aiText;
}
