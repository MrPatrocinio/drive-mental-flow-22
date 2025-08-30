// Componente mais básico possível - SEM HOOKS
function TestApp() {
  console.log('TestApp: Renderizando componente básico sem hooks');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>🧪 Teste Básico</h1>
      <p>Se você vê esta mensagem, o problema foi isolado!</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}

export default TestApp;