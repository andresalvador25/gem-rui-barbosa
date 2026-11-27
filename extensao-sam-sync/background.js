/**
 * Background Service Worker - Robô SAM CCB Vila Rui Barbosa
 * Realiza a ponte de comunicação bidirecional entre o App GEM e o SAM Oficial.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. Mensagem vinda do App GEM para iniciar a sincronização no SAM
  if (request.action === 'INICIAR_SINCRONIZACAO_SAM') {
    chrome.tabs.query({ url: '*://musical.congregacao.org.br/*' }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ 
          success: false, 
          error: 'Aba do SAM Oficial não encontrada! Por favor, abra o SAM (musical.congregacao.org.br) em outra aba e faça login.' 
        });
        return;
      }

      // Localiza preferencialmente a aba que está na página de Alunos do GEM
      let targetTab = tabs.find(t => t.url && t.url.includes('aluno')) || tabs[0];

      // Opcional: focar na aba do SAM para o usuário visualizar o robô trabalhando
      // chrome.tabs.update(targetTab.id, { active: true });

      chrome.tabs.sendMessage(targetTab.id, {
        action: 'EXECUTAR_LANCAMENTOS_SAM',
        payload: request.payload,
        senderTabId: sender.tab?.id
      }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ 
            success: false, 
            error: 'Erro de comunicação com a aba do SAM. Atualize a página do SAM e tente novamente.' 
          });
        } else {
          sendResponse(response || { success: true });
        }
      });
    });

    return true; // Mantém o canal aberto para resposta assíncrona
  }

  // 2. Mensagem vinda do SAM informando que a sincronização terminou
  if (request.action === 'SINCRONIZACAO_SAM_CONCLUIDA') {
    // Procura a aba do App GEM para notificar a conclusão
    chrome.tabs.query({}, (tabs) => {
      const gemTabs = tabs.filter(t => 
        t.url && (t.url.includes('gem-rui-barbosa.vercel.app') || t.url.includes('localhost'))
      );

      gemTabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'NOTIFICAR_GEM_CONCLUIDO',
          resultado: request.resultado
        }).catch(() => {});
      });
    });

    sendResponse({ success: true });
  }
});
