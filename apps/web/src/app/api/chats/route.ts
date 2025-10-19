import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Use Better Auth server-side validation through the existing auth endpoint
    const sessionUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/get-session`;

    const response = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        ...Object.fromEntries(await headers()),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Session check failed:",
        response.status,
        response.statusText
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await response.json();

    if (!session?.user) {
      console.error("No user session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { initialMessage } = body;

    if (!initialMessage) {
      return NextResponse.json(
        { error: "Initial message is required" },
        { status: 400 }
      );
    }

    // For now, generate a simple chat ID
    // In a real implementation, this would create a chat in the database
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log("Created chat:", {
      chatId,
      user: session.user.email,
      initialMessage,
    });

    return NextResponse.json({
      success: true,
      chatId,
      message: "Chat created successfully",
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      {
        error: "Failed to create chat",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Add GET endpoint for fetching chat history
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/get-session`;

    const response = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        ...Object.fromEntries(await headers()),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await response.json();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return mock chat history for now
    const mockChats = [
      {
        id: "1",
        title: "Project Discussion",
        lastMessage: "Let's review the architecture",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        unread: 2,
      },
      {
        id: "2",
        title: "Code Review",
        lastMessage: "The pull request looks good",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        unread: 0,
      },
    ];

    return NextResponse.json({
      success: true,
      chats: mockChats,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
