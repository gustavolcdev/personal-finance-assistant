// Importa as funções de chamada de API do arquivo api.js
import { uploadPlanilhaApi, sendChatMessageApi } from './actions/api.js';
// Importa a classe UIManager do arquivo UIManager.js
import UIManager from './model/UIManager.js';

// --- Referências aos elementos do DOM ---
// Obtém a referência para o formulário de upload
const uploadForm = document.getElementById('uploadForm');
// Obtém a referência para a seção que contém o formulário de upload
const uploadSectionDiv = document.getElementById('uploadSection');
// Obtém a referência para a div de carregamento
const loadingDiv = document.getElementById('loading');
// Obtém a referência para a área onde o relatório será exibido
const reportAreaDiv = document.getElementById('reportArea');
// Obtém a referência para a div que conterá o conteúdo do relatório
const reportContentDiv = document.getElementById('reportContent');
// Obtém a referência para a área de chat
const chatAreaDiv = document.getElementById('chatArea');
// Obtém a referência para a caixa de chat onde as mensagens são exibidas
const chatBoxDiv = document.getElementById('chatBox');
// Obtém a referência para o input de texto do chat
const chatInput = document.getElementById('chatInput');
// Obtém a referência para o botão de enviar mensagem do chat
const sendChatBtn = document.getElementById('sendChatBtn');
// Obtém a referência para o botão flutuante de nova análise
const newAnalysisBtn = document.getElementById('newAnalysisBtn');

// --- Cria uma instância do UIManager, passando as referências dos elementos ---
// Passa um objeto contendo todas as referências dos elementos do DOM para o construtor do UIManager
const uiManager = new UIManager({
    uploadSectionDiv,
    loadingDiv,
    reportAreaDiv,
    reportContentDiv,
    chatAreaDiv,
    chatBoxDiv,
    chatInput,
    sendChatBtn,
    newAnalysisBtn
});


// --- Funções de Manipulação de Eventos ---

/**
 * Lida com o evento de envio do formulário de upload da planilha.
 * @param {Event} event - O objeto do evento de envio do formulário.
 */
async function handleUploadFormSubmit(event) {
    // Previne o comportamento padrão de envio do formulário (que recarregaria a página)
    event.preventDefault();

    // Esconde a seção de upload, mostra loading e limpa áreas de conteúdo usando UIManager
    uiManager.showUploadSection();
    uiManager.showLoading(); // Usa o método showLoading para exibir a mensagem de carregamento
    uiManager.clearContentAreas(); // Limpa áreas de conteúdo e adiciona mensagem inicial do chat

    // Obtém o arquivo selecionado pelo usuário
    const fileInput = document.querySelector('#uploadForm input[type="file"]');
    const file = fileInput.files[0];

    // Verifica se um arquivo foi selecionado
    if (!file) {
        alert('Por favor, selecione um arquivo para enviar.');
        uiManager.hideLoading(); // Usa o método hideLoading para esconder a mensagem de carregamento
        uiManager.showUploadSection(); // Mostra upload novamente se nenhum arquivo foi selecionado
        return;
    }

    // Cria um objeto FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('planilha', file); // 'planilha' deve corresponder ao nome no backend (nome do campo no Multer)

    try {
        // Chama a função de API para enviar a planilha para o backend
        const result = await uploadPlanilhaApi(formData);

        // Verifica se o relatório está presente na resposta (indica análise bem-sucedida)
        if (result.report) {
            // Renderiza o Markdown para HTML e exibe o relatório usando UIManager
            // Verifica se a biblioteca 'marked' está disponível globalmente (carregada via CDN no HTML)
            const renderedReport = typeof marked !== 'undefined' ? marked.parse(result.report) : result.report;
            uiManager.elements.reportContentDiv.innerHTML = renderedReport; // Acessa o elemento via instância do UIManager

            // Mostra as áreas de relatório e chat com animação usando UIManager
            uiManager.showReportAndChatAreas();

        } else {
            // Se não houver relatório na resposta, exibe uma mensagem de erro no relatório
            uiManager.elements.reportContentDiv.textContent = 'Ocorreu um erro ao gerar o relatório.'; // Acessa o elemento via instância do UIManager
            uiManager.elements.reportAreaDiv.style.display = 'block'; // Acessa o elemento via instância do UIManager
            // Adiciona a classe 'visible' para a animação de entrada da área de relatório
            setTimeout(() => { uiManager.elements.reportAreaDiv.classList.add('visible'); }, 50); // Acessa o elemento via instância do UIManager
        }

    } catch (error) {
        // Captura e exibe quaisquer erros que ocorrerem durante o processo de upload/análise
        console.error('Erro durante o upload ou processamento:', error);
        uiManager.elements.reportContentDiv.textContent = `Erro: ${error.message}`; // Acessa o elemento via instância do UIManager
        uiManager.elements.reportAreaDiv.style.display = 'block'; // Acessa o elemento via instância do UIManager
        // Adiciona a classe 'visible' para a animação de entrada da área de relatório em caso de erro
        setTimeout(() => { uiManager.elements.reportAreaDiv.classList.add('visible'); }, 50); // Acessa o elemento via instância do UIManager
    } finally {
        // Esconde a mensagem de carregamento ao final do processo (sucesso ou falha)
        uiManager.hideLoading(); // Usa o método hideLoading para esconder a mensagem de carregamento
         // Se houve um erro e o relatório/chat não apareceu, mostra a seção de upload novamente
        if (uiManager.elements.reportAreaDiv.style.display === 'none') { // Acessa o display do elemento via instância do UIManager
             uiManager.showUploadSection();
        }
        
        const fileInput = document.querySelector('#uploadForm input[type="file"]');
        fileInput.value = ''; // Limpa o valor do input file
    }
}

/**
 * Lida com o evento de envio de mensagem no chat.
 */
async function handleSendChatMessage() {
    // Obtém a mensagem do input, removendo espaços em branco extras, usando UIManager
    const message = uiManager.elements.chatInput.value.trim(); // Acessa o elemento via instância do UIManager

    // Não envia mensagem vazia
    if (!message) {
        return;
    }

    // Adiciona a mensagem do usuário ao chat usando UIManager
    uiManager.addMessage('Você', message, 'user');
    // Limpa o input de chat usando UIManager
    uiManager.elements.chatInput.value = ''; // Acessa o elemento via instância do UIManager
    // Desabilita input e botão enquanto espera a resposta da IA usando UIManager
    uiManager.setChatInputEnabled(false);

    // Opcional: Adicionar uma mensagem "digitando..." da IA enquanto espera

    try {
        // Chama a função de API para enviar a mensagem para o backend do chat
        const result = await sendChatMessageApi(message);

        // Verifica se há uma resposta da IA
        if (result.reply) {
            // Adiciona a resposta da IA ao chat usando UIManager
            uiManager.addMessage('IA', result.reply, 'ia');
        } else {
             // Se não houver resposta, adiciona uma mensagem padrão usando UIManager
             uiManager.addMessage('IA', 'Não consegui obter uma resposta no momento.', 'ia');
        }

    } catch (error) {
        // Captura e exibe erros durante a interação do chat
        console.error('Erro ao enviar mensagem de chat:', error);
        uiManager.addMessage('IA', 'Desculpe, ocorreu um erro ao processar sua mensagem.', 'ia');
    } finally {
        // Reabilita input e botão do chat ao final do processo usando UIManager
        uiManager.setChatInputEnabled(true);
    }
}

/**
 * Lida com o evento de clique no botão flutuante "Nova Análise".
 * Reseta a interface para o estado inicial de upload.
 */
function handleNewAnalysisClick() {
    // Reseta a interface para o estado inicial de upload usando UIManager
    uiManager.showUploadSection();
     // Opcional: Limpar o input de arquivo selecionado anteriormente
    const fileInput = document.querySelector('#uploadForm input[type="file"]');
    fileInput.value = ''; // Limpa o valor do input file
    // Limpa as áreas de conteúdo e adiciona a mensagem inicial do chat usando UIManager
    uiManager.clearContentAreas();
}


// --- Inicialização: Adiciona Listeners de Eventos ---
// Aguarda o DOM ser completamente carregado antes de adicionar os listeners
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona listener para o envio do formulário de upload
    uploadForm.addEventListener('submit', handleUploadFormSubmit);
    // Adiciona listener para o clique no botão de enviar chat
    sendChatBtn.addEventListener('click', handleSendChatMessage);
    // Adiciona listener para a tecla Enter no input de chat
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Previne a quebra de linha padrão do Enter
            handleSendChatMessage();
        }
    });
    
    // Adiciona listener para o clique no botão flutuante de nova análise
    newAnalysisBtn.addEventListener('click', handleNewAnalysisClick);

    // Define o estado inicial da interface ao carregar a página usando UIManager
    uiManager.showUploadSection();

     // Limpa as áreas de conteúdo e adiciona a mensagem inicial do chat na carga inicial usando UIManager
    uiManager.clearContentAreas();
});
