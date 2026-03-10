import './globals.css';

export const metadata = {
  title: 'charlesfredricks.com, a very unimportant website',
  description: 'personal website of charles fredricks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
