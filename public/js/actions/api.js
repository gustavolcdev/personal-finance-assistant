/**
 * Envia o arquivo da planilha para o backend para análise.
 * @param {FormData} formData - O objeto FormData contendo o arquivo.
 * @returns {Promise<object>} - A resposta JSON do backend contendo o relatório.
 * @throws {Error} - Se a requisição falhar.
 */
async function uploadPlanilhaApi(formData) {
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData // O FormData é enviado como corpo da requisição
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido no servidor.' }));
            throw new Error(`Erro no servidor: ${response.status} - ${errorData.message || response.statusText}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Erro na chamada da API de upload:', error);
        throw error; // Propaga o erro para quem chamou
    }
}

/**
 * Envia uma mensagem de chat para o backend e obtém a resposta da IA.
 * @param {string} message - A mensagem do usuário.
 * @returns {Promise<object>} - A resposta JSON do backend contendo a resposta da IA.
 * @throws {Error} - Se a requisição falhar.
 */
async function sendChatMessageApi(message) {
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido no servidor.' }));
            throw new Error(`Erro no servidor de chat: ${response.status} - ${errorData.message || response.statusText}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Erro na chamada da API de chat:', error);
        throw error; // Propaga o erro para quem chamou
    }
}

// Exporta as funções de API
export {
    uploadPlanilhaApi,
    sendChatMessageApi
};
