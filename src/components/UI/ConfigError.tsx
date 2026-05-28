function ConfigError() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">⚙️</div>
        <h1 className="text-xl font-bold text-gray-100 mb-2">
          Yapılandırma eksik
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          Uygulama backend'e bağlanamıyor.
          Vercel ortam değişkenlerinde <code className="bg-gray-800 text-emerald-400 px-1.5 py-0.5 rounded">VITE_CONVEX_URL</code> tanımlanmamış görünüyor.
        </p>
        <div className="bg-gray-800 rounded-xl p-4 text-left text-xs text-gray-400 font-mono leading-relaxed">
          <p className="text-gray-500 mb-1"># Beklenen değişkenler</p>
          <p>VITE_CONVEX_URL=https://&lt;deployment&gt;.convex.cloud</p>
          <p>VITE_VAPID_PUBLIC_KEY=&lt;public key&gt;</p>
        </div>
        <p className="text-xs text-gray-600 mt-6">
          Vercel Dashboard → Settings → Environment Variables → ekle, sonra yeniden deploy et.
        </p>
      </div>
    </div>
  );
}

export default ConfigError;
