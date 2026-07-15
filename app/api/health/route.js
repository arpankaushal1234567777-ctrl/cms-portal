import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'CMS Proxy Server Running',
    session: {
      active: false,
      rollNumber: 'none',
      hasJar: false
    },
    env: {
      node: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL
    }
  });
}
