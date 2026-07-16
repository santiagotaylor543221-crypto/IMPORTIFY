export function renderNotFound() {
    return `
<div class="min-h-screen flex flex-col items-center justify-center text-white">
    <p class="text-8xl font-black text-slate-700">404</p>
    <h1 class="mt-6 text-2xl font-bold text-slate-300">Page not found</h1>
    <p class="mt-3 text-slate-500">The route you're looking for doesn't exist.</p>
    <a href="/" class="mt-8 rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition">
        ← Back to Home
    </a>
</div>
    `;
}
