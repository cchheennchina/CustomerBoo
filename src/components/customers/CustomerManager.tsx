"use client";

import { useMemo, useState } from "react";
import { GlassButton, GlassCard, SectionTitle } from "@/components/glass/GlassCard";

export interface CustomerRow {
  id: string;
  companyName: string;
  industry: string | null;
  keywords: string;
  contacts: Array<{
    id: string;
    name: string;
    title: string | null;
    isDecisionMaker: boolean;
  }>;
  opportunities: Array<{ id: string; name: string; healthScore: number; healthStatus: string }>;
  _count: { contacts: number; opportunities: number };
}

const emptyForm = {
  companyName: "",
  industry: "",
  keywords: "",
  contactName: "",
  contactTitle: "",
  isDecisionMaker: false,
};

export function CustomerManager({ initialCustomers }: { initialCustomers: CustomerRow[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const editingCustomer = useMemo(
    () => customers.find((c) => c.id === editingId),
    [customers, editingId]
  );

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(customer: CustomerRow) {
    setEditingId(customer.id);
    setForm({
      companyName: customer.companyName,
      industry: customer.industry ?? "",
      keywords: JSON.parse(customer.keywords || "[]").join(";"),
      contactName: customer.contacts[0]?.name ?? "",
      contactTitle: customer.contacts[0]?.title ?? "",
      isDecisionMaker: customer.contacts[0]?.isDecisionMaker ?? false,
    });
  }

  async function refreshList() {
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data.customers ?? []);
  }

  async function handleSubmit() {
    if (!form.companyName.trim()) {
      setMessage("公司名称必填");
      return;
    }
    setLoading(true);
    setMessage("");

    const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "操作失败");
      return;
    }

    setMessage(editingId ? "客户已更新" : "客户已添加");
    resetForm();
    await refreshList();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`确定删除客户「${name}」？关联机会也将一并删除。`)) return;

    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "删除失败");
      return;
    }
    setMessage("客户已删除");
    if (editingId === id) resetForm();
    await refreshList();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <GlassCard glow="cyan" className="xl:col-span-5">
        <SectionTitle
          title={editingId ? "编辑客户" : "新增客户"}
          subtitle={editingCustomer ? editingCustomer.companyName : "手动维护客户档案"}
          action={
            editingId ? (
              <GlassButton variant="ghost" onClick={resetForm}>
                取消编辑
              </GlassButton>
            ) : null
          }
        />
        <div className="grid gap-3 text-sm">
          <input
            placeholder="公司名称 *"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
          <input
            placeholder="行业"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
          <input
            placeholder="关键词（分号分隔）"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
          <input
            placeholder="主联系人"
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
          <input
            placeholder="联系人职务"
            value={form.contactTitle}
            onChange={(e) => setForm({ ...form, contactTitle: e.target.value })}
            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 outline-none"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isDecisionMaker}
              onChange={(e) =>
                setForm({ ...form, isDecisionMaker: e.target.checked })
              }
            />
            决策层联系人
          </label>
          <GlassButton onClick={handleSubmit} disabled={loading}>
            {editingId ? "保存更新" : "添加客户"}
          </GlassButton>
          {message ? <p className="text-accent-cyan">{message}</p> : null}
        </div>
      </GlassCard>

      <GlassCard className="xl:col-span-7">
        <SectionTitle title="客户列表" subtitle={`共 ${customers.length} 家`} />
        <div className="space-y-2">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{customer.companyName}</p>
                  <p className="text-sm text-white/50">
                    {customer.industry ?? "未填行业"} · 联系人{" "}
                    {customer._count.contacts} · 机会 {customer._count.opportunities}
                  </p>
                  {customer.contacts[0] ? (
                    <p className="mt-1 text-xs text-white/60">
                      主联系人：{customer.contacts[0].name}
                      {customer.contacts[0].title
                        ? `（${customer.contacts[0].title}）`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <GlassButton variant="ghost" onClick={() => startEdit(customer)}>
                    编辑
                  </GlassButton>
                  <GlassButton
                    variant="danger"
                    onClick={() => handleDelete(customer.id, customer.companyName)}
                  >
                    删除
                  </GlassButton>
                </div>
              </div>
            </div>
          ))}
          {customers.length === 0 ? (
            <p className="py-8 text-center text-white/50">暂无客户，请添加</p>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}
