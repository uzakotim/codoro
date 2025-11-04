import React from 'react'
import type { AppProps } from 'next/app'
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import '../styles/globals.css'

function MyApp({ Component, pageProps } : AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const popupPage = params.get('popup');
      if (popupPage) {
        router.replace(`/${popupPage}`);
      }
    }
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;