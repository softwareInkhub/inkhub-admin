import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Providers } from "@/store/provider";
import { TabProvider } from "@/components/layout/TabContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inkhub Admin",
  description: "Admin dashboard for Inkhub platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            <TabProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </TabProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
