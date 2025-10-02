import {redirect} from 'next/navigation';
 
// This page only renders for the root `/` path
export default function RootPage() {
  redirect('/en');
}
