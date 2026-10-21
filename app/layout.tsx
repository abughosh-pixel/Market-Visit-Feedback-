import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Fine | Market Visits',description:'Share what you saw, heard and learned on your market visit.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
