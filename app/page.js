'use client';

import { useState } from 'react';

export default function Home() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`/api/search?name=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch data');
            }

            setResult(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
                    Baby Name Explorer
                </h1>
                <p className="text-lg text-slate-600">
                    Discover the meaning, origin, and magic behind any name.
                </p>
            </div>

            <div className="glass-card rounded-2xl p-8 mb-12">
                <form onSubmit={handleSearch} className="flex gap-4 flex-col sm:flex-row">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter a baby name (e.g., Emma, Noah)..."
                        className="search-input flex-1 px-6 py-4 rounded-xl border border-slate-200 text-lg outline-none bg-white/50"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                    >
                        {loading ? <div className="loading-spinner" /> : 'Search'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-8 text-center animate-pulse">
                    {error}
                </div>
            )}

            {result && (
                <div className="result-card glass-card rounded-3xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-bold mb-2">{result.name}</h2>
                                <div className="flex gap-3 text-sm font-medium opacity-90">
                                    <span className="bg-white/20 px-3 py-1 rounded-full">{result.gender}</span>
                                    <span className="bg-white/20 px-3 py-1 rounded-full">{result.origin}</span>
                                    {result.religion !== 'N/A' && (
                                        <span className="bg-white/20 px-3 py-1 rounded-full">{result.religion}</span>
                                    )}
                                </div>
                            </div>
                            {result.howToWrite !== 'N/A' && (
                                <div className="text-right">
                                    <div className="text-3xl font-serif opacity-80">{result.howToWrite}</div>
                                    <div className="text-xs opacity-60 mt-1">Written as</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-3">Meaning</h3>
                            <p className="text-2xl text-slate-800 font-light leading-relaxed">
                                "{result.meaning}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <InfoBox label="Lucky Number" value={result.luckyNumber} icon="🔢" />
                            <InfoBox label="Lucky Color" value={result.luckyColor} icon="🎨" />
                            <InfoBox label="Lucky Day" value={result.luckyDay} icon="📅" />
                            <InfoBox label="Lucky Stone" value={result.luckyStone} icon="💎" />
                        </div>

                        {result.similarNames && result.similarNames.length > 0 && (
                            <div>
                                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4">Similar Names</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.similarNames.map((name) => (
                                        <button
                                            key={name}
                                            onClick={() => {
                                                setQuery(name);
                                                // Optional: auto-search
                                            }}
                                            className="tag px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Source link removed as requested */}
                    </div>
                </div>
            )}

            <div className="mt-16 text-center text-slate-400 text-sm">
                <p>API Documentation available at <a href="/api/docs" className="underline hover:text-indigo-500">/api/docs</a></p>
            </div>
        </div>
    );
}

function InfoBox({ label, value, icon }) {
    if (value === 'N/A') return null;
    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</div>
            <div className="font-semibold text-slate-700 truncate" title={value}>{value}</div>
        </div>
    );
}
