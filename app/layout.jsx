import './globals.css'

export const metadata = {
  title: 'Modern Weather App',
  description: 'A beautiful Next.js weather app with OpenWeatherMap',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
