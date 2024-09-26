import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Pimolnat Kaewboot",
    studentId: "660610779",
  });
};
