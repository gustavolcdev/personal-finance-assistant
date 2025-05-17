// Importa o módulo fs com promises
import { promises as fs } from 'fs';
// Importa a biblioteca xlsx
import XLSX from 'xlsx';
import dotenv from 'dotenv';
// Importa o SDK do Google Generative AI
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Classe responsável pela lógica de negócio financeira e interação com a IA.
 */
class FinanceService {
    constructor() {
        // Inicializa a Google Generative AI com a chave da API do ambiente
        // Certifique-se de que process.env.GOOGLE_API_KEY está definido (carregado via dotenv em app.js)
        dotenv.config();
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // Seleciona o modelo a ser utilizado (ex: gemini-pro)
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        // Variável para manter a sessão de chat (em memória)
        this.chatSession = null;
    }

    /**
     * Processa o arquivo da planilha, analisa com a IA e inicializa a sessão de chat.
     * @param {string} filePath - O caminho completo para o arquivo da planilha.
     * @returns {Promise<string>} - O relatório gerado pela IA.
     * @throws {Error} - Se ocorrer um erro durante o processamento ou interação com a IA.
     */
    async processPlanilhaAndAnalyze(filePath) {
        try {
            // Lê o arquivo da planilha
            const workbook = XLSX.readFile(filePath);
            // Assume que queremos a primeira aba da planilha
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Converte a planilha para um array de objetos JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
            // --- Lógica para o Primeiro Agente (Análise Financeira) ---

            // Cria o prompt para a IA, incluindo os dados financeiros em formato JSON
            const prompt = `Você é um auxiliar de finanças pessoais. Analise os seguintes dados financeiros em formato JSON e forneça um relatório detalhado para o usuário.
            O relatório deve incluir:
            1. Um resumo dos maiores gastos.
            2. Sugestões concretas de onde o usuário pode diminuir custos.
            3. Recomendações para traçar metas de investimento e como gastar menos.
            4. Qualquer outra observação relevante sobre os hábitos financeiros baseados nos dados.

            Dados Financeiros:
            ${JSON.stringify(jsonData, null, 2)}

            Por favor, formate o relatório de forma clara e fácil de ler.`;

            // Gera o conteúdo usando o modelo de IA
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const aiReport = response.text(); // O texto gerado pela IA
            // --- Inicializa a sessão de chat para o Segundo Agente ---
            // Passamos o relatório gerado como parte do histórico inicial do chat
            // para que o agente de chat tenha contexto.
            this.chatSession = this.model.startChat({
              history: [
                {
                  role: "user",
                  parts: [{ text: `Com base no seguinte relatório financeiro, responda a perguntas do usuário sobre ele:\n\n${aiReport}`}]
                },
                {
                  role: "model",
                  parts: [{ text: "Ok, estou pronto para responder perguntas sobre o relatório financeiro."}]
                },
              ]
            });

            // Retorna o relatório da IA
            return aiReport;

        } catch (error) {
            console.error('Erro no serviço de finanças:', error);
            throw error; // Propaga o erro
        } finally {
            try {
                await fs.unlink(filePath);
                console.log(`Arquivo temporário ${filePath} removido.`);
            } catch (unlinkError) {
                console.error('Erro ao remover o arquivo temporário:', unlinkError);
            }
        }
    }

    /**
     * Envia uma mensagem para a sessão de chat da IA.
     * @param {string} message - A mensagem do usuário.
     * @returns {Promise<string>} - A resposta da IA.
     * @throws {Error} - Se não houver sessão de chat ativa ou ocorrer um erro na interação.
     */
    async sendChatMessageToAI(message) {
        // Verifica se há uma sessão de chat ativa
        if (!this.chatSession) {
            throw new Error('Sessão de chat não iniciada. Por favor, envie uma planilha primeiro.');
        }

        if (!message) {
             throw new Error('Mensagem vazia.');
        }

        try {
            // Envia a mensagem do usuário para a sessão de chat da IA
            const result = await this.chatSession.sendMessage(message);
            const response = await result.response;
            const aiReply = response.text(); // A resposta da IA
            
            return aiReply;

        } catch (error) {
            console.error('Erro ao interagir com a sessão de chat da IA (Serviço):', error);
            throw error; // Propaga o erro
        }
    }
}

// Exporta uma instância da classe como export default
export default new FinanceService();
