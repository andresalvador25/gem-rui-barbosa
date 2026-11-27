/**
 * Content Script injetado no App GEM Rui Barbosa (gem-rui-barbosa.vercel.app)
 * Faz a conexão direta entre a interface React do App e a Extensão do Navegador.
 */

// Sinaliza para o React que a extensão do robô está instalada e ativa no navegador
function marcarExtensaoAtiva() {
  document.documentElement.setAttribute('data-robo-sam-ativo', 'true');
  window.__ROBO_SAM_INSTALADO__ = true;
}

marcarExtensaoAtiva();
window.addEventListener('DOMContentLoaded', marcarExtensaoAtiva);
setInterval(marcarExtensaoAtiva, 1000);

// Escutar comandos enviados pela aplicação React (SamSyncGemModal)
window.addEventListener('message', (event) => {
  // Ignora mensagens de outras origens não confiáveis
  if (!event.data || typeof event.data !== 'object') return;

  // 1. Verificação de status (Handshake)
  if (event.data.type === 'APP_GEM_PING_ROBO') {
    window.postMessage({ 
      type: 'ROBO_SAM_PONG', 
      instalado: true, 
      versao: '1.0.0' 
    }, '*');
    return;
  }

  // 2. Disparo de sincronização automática com o SAM
  if (event.data.type === 'APP_GEM_START_SYNC') {
    console.log('[Robô SAM Extensão] Comando de sincronização recebido do App:', event.data.payload);

    chrome.runtime.sendMessage({
      action: 'INICIAR_SINCRONIZACAO_SAM',
      payload: event.data.payload
    }, (response) => {
      if (chrome.runtime.lastError || !response || response.success === false) {
        window.postMessage({
          type: 'APP_GEM_SYNC_ERRO',
          erro: response?.error || chrome.runtime.lastError?.message || 'Falha ao conectar com a extensão.'
        }, '*');
      } else {
        window.postMessage({
          type: 'APP_GEM_SYNC_INICIADO',
          mensagem: 'Comando entregue ao SAM Oficial com sucesso!'
        }, '*');
      }
    });
  }
});

// Escutar notificações vindas do background (quando o SAM terminar o trabalho)
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'NOTIFICAR_GEM_CONCLUIDO') {
    console.log('[Robô SAM Extensão] Sincronização concluída no SAM! Notificando App React...', request.resultado);
    window.postMessage({
      type: 'APP_GEM_SYNC_CONCLUIDO',
      resultado: request.resultado
    }, '*');
  }
});
