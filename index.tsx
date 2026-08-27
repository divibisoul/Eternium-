import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { registerWithN01 } from './api/soul-mesh/peer-client';
const bootN02Mesh=async()=>{try{await registerWithN01();}catch(error){console.warn('[N02 MESH] N01 indisponível ou registro adiado:',error);}};
void bootN02Mesh();
const rootElement=document.getElementById('root');
if(!rootElement)throw new Error('Could not find root element to mount to');
ReactDOM.createRoot(rootElement).render(<React.StrictMode><App/></React.StrictMode>);
