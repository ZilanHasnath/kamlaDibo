import Script from "next/script";
import "./globals.css";

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#3b6ef0",
};

export const metadata = {
    metadataBase: new URL("https://kamladibo.vercel.app"),
    title: {
        default: "কামলা দিবো | Kamla Dibo - Day Laborer Gathering Spots & Hiring in Dhaka",
        template: "%s | কামলা দিবো",
    },
    description: "কামলা ডাকা ও খোঁজার সহজ মাধ্যম। Find and hire day laborers, daily wage workers, and construction helpers at the nearest gathering spots across Dhaka, Bangladesh.",
    keywords: [
        "কামলা দিবো",
        "Kamla Dibo",
        "দিনমজুর",
        "day laborer Dhaka",
        "day wage workers Dhaka",
        "daily labor market Dhaka",
        "labor hiring app Dhaka",
        "Mohammadpur day labor spot",
        "construction worker hire Dhaka",
        "শ্রমিক খোঁজার জায়গা",
        "দিনমজুর সমাবেশ স্থল",
        "Zilan Hasnath Lithon"
    ],
    authors: [{ name: "Zilan Hasnath Lithon", url: "https://zilanhasnathlithon.vercel.app/" }],
    creator: "Zilan Hasnath Lithon",
    publisher: "Kamla Dibo",
    openGraph: {
        type: "website",
        locale: "bn_BD",
        alternateLocale: "en_US",
        url: "https://kamladibo.vercel.app/",
        siteName: "কামলা দিবো | Kamla Dibo",
        title: "কামলা দিবো | Kamla Dibo - Day Laborer Gathering Spots & Hiring in Dhaka",
        description: "দিনমজুর ও শ্রমিকদের খোঁজার এবং যোগাযোগের সবচেয়ে নির্ভরযোগ্য ডিজিটাল প্ল্যাটফর্ম। Find the nearest day laborer gathering spots in Dhaka.",
    },
    twitter: {
        card: "summary_large_image",
        title: "কামলা দিবো | Kamla Dibo - Day Laborer Gathering Spots, Dhaka",
        description: "Find and hire daily wage workers and laborers across Dhaka instantly.",
        creator: "@ZilanHasnath",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Kamla Dibo",
        "alternateName": ["কামলা দিবো", "Kamla Dibo Dhaka"],
        "url": "https://kamladibo.vercel.app/",
        "description": "Find the nearest place where day laborers gather in Dhaka to get hired.",
        "inLanguage": ["bn", "en"],
        "creator": {
            "@type": "Person",
            "name": "Zilan Hasnath Lithon",
            "url": "https://zilanhasnathlithon.vercel.app/"
        }
    };

    return (
        <html lang="bn">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <Script
                    async
                    src="https://www.googletagmanager.com/gtm.js?id=GTM-W67QXMVN"
                    strategy="beforeInteractive"
                />
                <Script id="google-analytics" strategy="beforeInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                    `}
                </Script>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body style={{ fontFamily: "'Hind Siliguri', sans-serif" }} className="bg-gray-50 text-gray-900">
                <main>{children}</main>
            </body>
        </html>
    );
}