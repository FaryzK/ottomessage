import { create } from "venom-bot";

let client = null; // Store the client instance globally to reuse it

export async function GET(req) {
  if (client) {
    return new Response(
      JSON.stringify({ message: "WhatsApp client already initialized" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Load the WhatsApp client with the saved session
    client = await create({
      session: "whatsapp-bot-fgb4tuoEjocPU5ByQK4Lhmb74Pi1",
      folderNameToken: "tokens", // Ensure this folder matches your session folder
    });

    return new Response(
      JSON.stringify({ message: "WhatsApp client initialized successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error initializing WhatsApp client:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to initialize WhatsApp client",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export function POST(req) {
  return new Response(null, {
    status: 405,
    headers: { Allow: "GET" },
  });
}
