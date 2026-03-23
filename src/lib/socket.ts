import net from "node:net";
import { randomUUID } from "node:crypto";
import type { DaemonRequest, DaemonResponse } from "./types.js";
import { getSocketPath } from "./paths.js";

export async function sendDaemonRequest(
  input: Omit<DaemonRequest, "id">
): Promise<DaemonResponse> {
  const request: DaemonRequest = { id: randomUUID(), ...input };

  return await new Promise<DaemonResponse>((resolve, reject) => {
    const socket = net.createConnection(getSocketPath());
    let data = "";

    socket.on("connect", () => {
      socket.write(JSON.stringify(request) + "\n");
    });

    socket.on("data", (chunk) => {
      data += chunk.toString("utf8");
      const newlineIndex = data.indexOf("\n");
      if (newlineIndex >= 0) {
        const line = data.slice(0, newlineIndex);
        socket.end();
        resolve(JSON.parse(line) as DaemonResponse);
      }
    });

    socket.on("error", reject);
  });
}
