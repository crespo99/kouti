// proxy.conf.cjs

module.exports = {
  '/colline-rest-api/services': {
    target: 'http://localhost:8085/colline-rest-api/services',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug', // This will log internal proxy events
    pathRewrite: {
      '^/colline-rest-api/services': '',
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('🎯 [Proxy Request] Original URL:', req.originalUrl);
      console.log('📘 [Proxy Request] Method:', req.method);
      console.log('📎 [Proxy Request] Headers:', proxyReq.getHeaders ? JSON.stringify(proxyReq.getHeaders(), null, 2) : 'N/A');
      // Optional: Log body if present
      if (req.body) {
        console.log('📦 [Proxy Request] Body:', req.body);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('✅ [Proxy Response] Status:', proxyRes.statusCode);
      console.log('📥 [Proxy Response] Headers:', JSON.stringify(proxyRes.headers, null, 2));
      console.log('🔗 [Proxy Response] For URL:', req.originalUrl);
    },
    onError: (err, req, res) => {
      console.error('❌ [Proxy Error] Proxy failed:', err);
      console.error('📌 [Proxy Error] Request URL:', req.originalUrl);
      console.error('🚨 [Proxy Error] Error details:', err.message, err.stack);

      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(
          JSON.stringify({
            error: 'ProxyError',
            message: 'Failed to reach backend',
            details: err.message,
          })
        );
      }
    },
  },
};