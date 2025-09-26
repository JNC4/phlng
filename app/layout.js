import './globals.css'

export const metadata = {
  title: 'Philosophical Network Graph',
  description: 'Interactive visualization for mapping philosophical ideas and their relationships',
  keywords: 'philosophy, network, graph, visualization, ideas, knowledge, reasoning',
  author: 'Your Name',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}