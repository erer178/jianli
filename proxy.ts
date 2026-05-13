import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 保护所有路由，必须登录才能访问
const isProtectedRoute = createRouteMatcher(['(.*)']);

// 🔴 注意这里加了 async 和 await
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};