import { Outlet, ScrollRestoration } from 'react-router';

export default function ScrollToTop() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
