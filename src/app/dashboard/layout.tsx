import type { Metadata } from "next";
import DashboardSidebar from "@/components/client/DashboardSidebar";
import AIChatbot from "@/components/client/AIChatbot";

export const metadata: Metadata = {
  title: "Dashboard | Sentience",
  description: "Your AI-powered financial dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030303]">
      <DashboardSidebar />
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
      <AIChatbot />
    </div>
  );
}
