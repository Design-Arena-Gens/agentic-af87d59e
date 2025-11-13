export const metadata = {
  title: "Social AI Agent",
  description: "Generate and orchestrate content for all major social platforms",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
