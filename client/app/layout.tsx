import type { Metadata } from "next";
import { Inter } from "next/font/google";
import './globals.css'
import DashboardWrapper from "./dashboardWrapper";
import { Suspense } from "react";
import Loader from './(components)/Loading'


const inter = Inter({ subsets: ["latin"] });



export const metadata: Metadata = {
  title: "WORKFORGE",
  description: "Project management website created in next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<Loader/>}> 
          <DashboardWrapper>
            {children}
          </DashboardWrapper>
        </Suspense>
      </body>
    </html>
  );
}
