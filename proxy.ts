import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // "/" shows the products page, and the address bar stays "/"
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/produits'
    return NextResponse.rewrite(url)
  }

  // the old address goes to "/" (query string kept, e.g. ?categorie=salon)
  if (pathname === '/produits') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url, 308)
  }
}

export const config = { matcher: ['/', '/produits'] }