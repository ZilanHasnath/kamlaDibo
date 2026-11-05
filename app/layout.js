import "./globals.css";

export const metadata = {
  title: "কামলা দিবো | Kamla Dibo - Day Laborer Gathering Spots, Dhaka",
  description: "Find the nearest place where day laborers gather in Dhaka to get hired.",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#1877f2" };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
