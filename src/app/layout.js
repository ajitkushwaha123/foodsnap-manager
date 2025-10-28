
import { Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/global/app-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "NPTEL Prep Platform | AI-Powered Learning",
  description:
    "Prepare for NPTEL exams smarter — attempt quizzes, summarize notes, and understand PDFs using AI assistance.",
};

export default function RootLayout({ children }) {
  return (
    <AppShell>
      <html lang="en">
        <body
          className={`${poppins.variable} font-sans antialiased bg-gray-50 text-gray-900`}
        >
          {children}
        </body>
      </html>
    </AppShell>
  );
}
