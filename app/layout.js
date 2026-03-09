import './globals.css';

export const metadata = {
  title: 'charlesfredricks.com, least important site on the internet',
  description: 'A minimalist, terminal-themed personal portfolio website.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
