import { DB, readDB, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { Database, Payload } from "@lib/DB";

export const GET = async (request: NextRequest) => {
  const roomId = request.nextUrl.searchParams.get("roomId");

  readDB();
  const foundDupe = (<Database>DB).rooms.find((room) => room.roomId === roomId);
  if (!foundDupe) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }
  (<Database>DB).messages = (<Database>DB).messages.filter((msg) => (msg.roomId === roomId));
  return NextResponse.json({
    ok: true,
    messages : (<Database>DB).messages,
  });

  };

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { roomId, messageText } = body;

  readDB();
  const foundDupe = (<Database>DB).rooms.find((room) => room.roomId === roomId);
  if (!foundDupe) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }
  
  const messageId = nanoid();

  (<Database>DB).messages.push({
    roomId: roomId,
    messageId: messageId,
    messageText: messageText,
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId: messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  const payload = checkToken();
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  
  const { role } = <Payload>payload;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const { messageId } = body;

  readDB();
  if (role === "SUPER_ADMIN") {
    const foundDupe = (<Database>DB).messages.find((msg) => msg.messageId === messageId);
    if (!foundDupe) {
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }

  (<Database>DB).messages = (<Database>DB).messages.filter((msg) => msg.messageId !== messageId);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
  }
};
