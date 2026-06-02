import { mockCrmAdapter } from "@/lib/crm/adapters/mock";

export async function GET() {
  const result = await mockCrmAdapter.syncPull();
  return Response.json(result);
}
