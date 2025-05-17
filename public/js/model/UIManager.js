/**
 * Classe responsável por gerenciar a interface do usuário (DOM).
 */
class UIManager {
    /**
     * Construtor que recebe as referências dos elementos do DOM.
     * @param {object} elements - Um objeto contendo referências para os elementos do DOM.
     * @param {HTMLElement} elements.uploadSectionDiv - Div da seção de upload.
     * @param {HTMLElement} elements.loadingDiv - Div da mensagem de carregamento.
     * @param {HTMLElement} elements.reportAreaDiv - Área do relatório.
     * @param {HTMLElement} elements.reportContentDiv - Conteúdo do relatório.
     * @param {HTMLElement} elements.chatAreaDiv - Área do chat.
     * @param {HTMLElement} elements.chatBoxDiv - Caixa de mensagens do chat.
     * @param {HTMLInputElement} elements.chatInput - Input de texto do chat.
     * @param {HTMLButtonElement} elements.sendChatBtn - Botão de enviar do chat.
     * @param {HTMLButtonElement} elements.newAnalysisBtn - Botão flutuante de nova análise.
     */
    constructor(elements) {
        this.elements = elements;
        // Garante que o botão flutuante esteja escondido inicialmente via JS
        this.elements.newAnalysisBtn.style.display = 'none';
    }

    /**
     * Adiciona uma mensagem à caixa de chat.
     * @param {string} sender - O remetente da mensagem ('Você' ou 'IA').
     * @param {string} text - O texto da mensagem.
     * @param {string} type - O tipo de mensagem ('user' ou 'ia') para estilização.
     */
    addMessage(sender, text, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', type);

        // Renderiza o Markdown para HTML para mensagens da IA
        let formattedText = text;
        // Verifica se a biblioteca 'marked' está disponível globalmente (carregada via CDN no HTML)
        // e se a mensagem é da IA antes de tentar renderizar
        if (type === 'ia' && typeof marked !== 'undefined') {
             formattedText = marked.parse(text);
        }

        messageElement.innerHTML = `<strong>${sender}:</strong> ${formattedText}`;
        this.elements.chatBoxDiv.appendChild(messageElement);
        this.elements.chatBoxDiv.scrollTop = this.elements.chatBoxDiv.scrollHeight; // Rolagem automática
    }

    /**
     * Mostra a seção de upload e esconde as áreas de relatório e chat.
     */
    showUploadSection() {
        this.elements.uploadSectionDiv.style.display = 'block';
        this.elements.loadingDiv.style.display = 'none';
        this.elements.reportAreaDiv.style.display = 'none';
        // Remove a classe 'visible' para garantir que a animação de entrada funcione na próxima vez
        this.elements.reportAreaDiv.classList.remove('visible');
        this.elements.chatAreaDiv.style.display = 'none';
        // Remove a classe 'visible' para garantir que a animação de entrada funcione na próxima vez
        this.elements.chatAreaDiv.classList.remove('visible');
        // Esconde o botão flutuante
        this.elements.newAnalysisBtn.style.display = 'none';
    }

    /**
     * Mostra as áreas de relatório e chat com animação.
     */
    showReportAndChatAreas() {
         this.elements.reportAreaDiv.style.display = 'block';
         // Adiciona um pequeno delay antes de adicionar a classe 'visible' para ativar a transição CSS
         setTimeout(() => {
              this.elements.reportAreaDiv.classList.add('visible');
         }, 50); // Pequeno delay para a transição

         this.elements.chatAreaDiv.style.display = 'block';
          // Adiciona um pequeno delay antes de adicionar a classe 'visible' para ativar a transição CSS
          setTimeout(() => {
             this.elements.chatAreaDiv.classList.add('visible');
          }, 150); // Um pouco mais de delay

         // Mostra o botão flutuante
         this.elements.newAnalysisBtn.style.display = 'flex'; // Usa 'flex' para centralizar o conteúdo '+'
    }

    /**
     * Limpa o conteúdo do relatório e da caixa de chat, adicionando a mensagem inicial da IA.
     */
    clearContentAreas() {
        // Limpa o conteúdo do relatório
        this.elements.reportContentDiv.innerHTML = '';
        // Limpa todas as mensagens do chat
        this.elements.chatBoxDiv.innerHTML = '';
        // Adiciona a mensagem inicial da IA de volta à caixa de chat
        // Verifica se 'marked' está disponível globalmente antes de usar
        const initialAIMessage = typeof marked !== 'undefined' ? marked.parse('Olá! Como posso ajudar com seu relatório financeiro?') : 'Olá! Como posso ajudar com seu relatório financeiro?';
        this.addMessage('IA', initialAIMessage, 'ia');
    }

    /**
     * Habilita ou desabilita o input de texto e o botão de enviar do chat.
     * @param {boolean} enabled - True para habilitar, False para desabilitar.
     */
    setChatInputEnabled(enabled) {
        this.elements.chatInput.disabled = !enabled;
        this.elements.sendChatBtn.disabled = !enabled;
        if (enabled) {
            this.elements.chatInput.focus(); // Coloca o foco de volta no input quando habilitado
        }
    }

     /**
      * Exibe a mensagem de carregamento.
      */
     showLoading() {
         this.elements.loadingDiv.style.display = 'block';
     }

     /**
      * Esconde a mensagem de carregamento.
      */
     hideLoading() {
         this.elements.loadingDiv.style.display = 'none';
     }
}

// Exporta a classe para ser importada em outros arquivos
export default UIManager;
