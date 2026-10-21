import {getChatGPTUser} from '../chatgpt-auth';
import {ownerEmail} from '../../lib/access';
import Home from '../survey';
import {AccessGate} from '../page';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();if(!user||!ownerEmail(user.email))return <AccessGate signedIn={!!user} workspace/>;return <Home owner initialScreen="admin" userEmail={user.email}/>}
