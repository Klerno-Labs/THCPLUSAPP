import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// ─── POST: Upload File to Vercel Blob ───────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // ── Validate file type ──
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: "Only JPG, PNG, and WebP images are allowed",
          allowed: ALLOWED_TYPES,
        },
        { status: 400 }
      );
    }

    // ── Validate file size ──
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          message: "Maximum file size is 5MB",
          maxSize: MAX_SIZE,
        },
        { status: 400 }
      );
    }

    // ── Generate a clean filename ──
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "-")
      .toLowerCase();
    const timestamp = Date.now();
    const filename = `uploads/${timestamp}-${safeName}`;

    // ── Upload to Vercel Blob ──
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json(
      {
        url: blob.url,
        pathname: blob.pathname,
        contentType: file.type,
        size: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
