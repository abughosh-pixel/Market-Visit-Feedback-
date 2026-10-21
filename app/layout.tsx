import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Fine | Market Visits',description:'Complete your market visit report and upload photos.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
