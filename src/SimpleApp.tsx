import React from 'react';

// Componente mínimo para testar se React funciona
const SimpleApp: React.FC = () => {
  console.log('SimpleApp: Testando React básico', { React: typeof React });
  
  if (!React) {
    return <div>React não disponível</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Teste React Simples</h1>
      <p>Se você está vendo isso, React está funcionando!</p>
      <p>React version: {React.version || 'desconhecida'}</p>
    </div>
  );
};

export default SimpleApp;