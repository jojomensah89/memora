import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const SESSION_ERROR_MESSAGE = "Unauthorized";
const CHAT_ID_PREFIX = "chat";
const RANDOM_STRING_RADIX = 36;
const RANDOM_STRING_START = 2;
const RANDOM_STRING_LENGTH = 9;
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_AGO_PROJECT_DISCUSSION = 2;
const HOURS_AGO_CODE_REVIEW = 5;

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
      return NextResponse.json(
        { error: SESSION_ERROR_MESSAGE },
        { status: 401 }
      );
    }

    const session = await response.json();

    if (!session?.user) {
      return NextResponse.json(
        { error: SESSION_ERROR_MESSAGE },
        { status: 401 }
      );
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
    const randomComponent = Math.random()
      .toString(RANDOM_STRING_RADIX)
      .slice(RANDOM_STRING_START, RANDOM_STRING_START + RANDOM_STRING_LENGTH);
    const chatId = `${CHAT_ID_PREFIX}_${Date.now()}_${randomComponent}`;

    return NextResponse.json({
      success: true,
      chatId,
      message: "Chat created successfully",
    });
  } catch (error) {
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
export async function GET(_request: NextRequest) {
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
      return NextResponse.json(
        { error: SESSION_ERROR_MESSAGE },
        { status: 401 }
      );
    }

    const session = await response.json();

    if (!session?.user) {
      return NextResponse.json(
        { error: SESSION_ERROR_MESSAGE },
        { status: 401 }
      );
    }

    // Return mock chat history for now
    const mockChats = [
      {
        id: "1",
        title: "Project Discussion",
        lastMessage: "Let's review the architecture",
        timestamp: new Date(
          Date.now() -
            MILLISECONDS_IN_SECOND *
              SECONDS_IN_MINUTE *
              MINUTES_IN_HOUR *
              HOURS_AGO_PROJECT_DISCUSSION
        ).toISOString(),
        unread: 2,
      },
      {
        id: "2",
        title: "Code Review",
        lastMessage: "The pull request looks good",
        timestamp: new Date(
          Date.now() -
            MILLISECONDS_IN_SECOND *
              SECONDS_IN_MINUTE *
              MINUTES_IN_HOUR *
              HOURS_AGO_CODE_REVIEW
        ).toISOString(),
        unread: 0,
      },
    ];

    return NextResponse.json({
      success: true,
      chats: mockChats,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
