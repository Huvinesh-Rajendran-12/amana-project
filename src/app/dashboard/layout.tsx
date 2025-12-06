import type { Metadata } from "next";
import DashboardSidebar from "@/components/client/DashboardSidebar";
import AIInputBar from "@/components/client/AIInputBar";

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
    <div className="min-h-screen bg-black">
      <DashboardSidebar />
      <main className="lg:ml-64 min-h-screen">
        <AIInputBar />
        {children}
      </main>
    </div>
  );
}
