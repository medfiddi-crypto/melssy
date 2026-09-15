export const dynamic = "force-dynamic";

import { getApiTarget } from "@/lib/api-target";

const apiTarget = getApiTarget();

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const url = new URL(`/v1/${path.join("/")}`, apiTarget);
  url.search = new URL(request.url).search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const idempotencyKey = request.headers.get("idempotency-key");
  if (contentType) headers.set("content-type", contentType);
  if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");
    const requestId = response.headers.get("x-request-id");
    if (responseContentType) responseHeaders.set("content-type", responseContentType);
    if (requestId) responseHeaders.set("x-request-id", requestId);
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch (error) {
    console.error("MELSSY API proxy failed", { url: url.toString(), error });
    return Response.json({ detail: "Le service de commande est indisponible." }, { status: 503 });
  }
}

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context);
}
