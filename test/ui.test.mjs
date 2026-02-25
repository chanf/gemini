import assert from "node:assert/strict";
import test from "node:test";

import { handleUiRequest } from "../src/ui/app.mjs";

test("handleUiRequest returns html for /ui paths", async () => {
  const response = handleUiRequest("/ui");
  assert.ok(response, "expected response for /ui");
  assert.equal(response.status, 200);
  const contentType = response.headers.get("content-type") ?? "";
  assert.match(contentType, /text\/html/);

  const body = await response.text();
  assert.ok(body.includes("Gemini Proxy Test Console"));
});

test("handleUiRequest ignores non-ui paths", () => {
  const response = handleUiRequest("/v1/models");
  assert.equal(response, undefined);
});
