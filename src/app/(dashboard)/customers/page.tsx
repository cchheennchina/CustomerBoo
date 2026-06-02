import { TopBar } from "@/components/layout/TopBar";
import { CustomerManager } from "@/components/customers/CustomerManager";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      contacts: true,
      opportunities: {
        select: { id: true, name: true, healthScore: true, healthStatus: true },
      },
      _count: { select: { contacts: true, opportunities: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <TopBar title="客户信息管理" />
      <CustomerManager initialCustomers={customers} />
    </>
  );
}
