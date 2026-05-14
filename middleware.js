export default function middleware(request) {
  const auth = request.headers.get('Authorization') || '';

  if (auth.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6));
    const password = decoded.slice(decoded.indexOf(':') + 1);
    if (password === process.env.DASHBOARD_PASSWORD) {
      return; // pass through
    }
  }

  return new Response('Protected', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="LIEBEZURBIBEL Dashboard"' },
  });
}

export const config = { matcher: '/:path*' };
