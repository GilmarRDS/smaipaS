import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

try {
  console.log('Iniciando a aplicação...');
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Elemento root não encontrado');
  }
  const root = createRoot(rootElement);
  console.log('Root criado, renderizando App...');
  root.render(
    <App />
  );
  console.log('App renderizado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar a aplicação:', error);
}
