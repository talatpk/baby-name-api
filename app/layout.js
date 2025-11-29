import './globals.css';

export const metadata = {
    title: 'Baby Name Search API',
    description: 'Search for baby name meanings, origins, and more.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 text-slate-800">
                    {children}
                </main>
            </body>
        </html>
    );
}
