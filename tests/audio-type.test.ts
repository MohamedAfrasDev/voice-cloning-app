import assert from "node:assert/strict";
import { test } from "node:test";
import { audioResponseHeaders, inspectAudio } from "@/lib/audio-type";

// 12 seconds of 8-bit mono PCM, with markup hidden in the samples.
function wavWithMarkup() {
  const rate = 8000;
  const samples = Buffer.alloc(rate * 12, 128);
  samples.write("<script>alert(1)</script>");

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + samples.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate, 28);
  header.writeUInt16LE(1, 32);
  header.writeUInt16LE(8, 34);
  header.write("data", 36);
  header.writeUInt32LE(samples.length, 40);

  return new Uint8Array(Buffer.concat([header, samples]));
}

test("identifies a WAV from its bytes", async () => {
  assert.deepEqual(await inspectAudio(wavWithMarkup()), {
    contentType: "audio/wav",
    duration: 12,
  });
});

test("rejects content that isn't audio", async () => {
  const html = new TextEncoder().encode("<html><script></script></html>");
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );

  assert.equal(await inspectAudio(html), null);
  assert.equal(await inspectAudio(new Uint8Array(png)), null);
  assert.equal(await inspectAudio(new Uint8Array()), null);
});

test("never serves stored audio as an active content type", () => {
  for (const stored of [
    "text/html",
    "image/svg+xml",
    "application/xhtml+xml",
    "audio/wav, text/html",
    null,
  ]) {
    const headers = audioResponseHeaders(stored, "private");

    assert.equal(headers["Content-Type"], "application/octet-stream");
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.match(headers["Content-Security-Policy"], /sandbox/);
  }
});

test("keeps the audio type of existing objects", () => {
  for (const stored of ["audio/wav", "audio/x-m4a", "audio/mpeg"]) {
    assert.equal(
      audioResponseHeaders(stored, "private")["Content-Type"],
      stored,
    );
  }
});
