// Importa a instância do serviço de finanças usando import default
import financeService from '../services/financeService.js'; // Note a extensão .js

/**
 * Classe responsável por lidar com as requisições HTTP e orquestrar as respostas.
 */
class FinanceController {
    /**
     * Construtor do Controller.
     * @param {object} service - A instância do serviço de finanças a ser utilizada.
     */
    constructor(service) {
        this.financeService = service;
    }

    /**
     * Lida com o upload da planilha e inicia a análise.
     * @param {object} req - O objeto de requisição do Express.
     * @param {object} res - O objeto de resposta do Express.
     */
    async uploadPlanilha(req, res) {
        // req.file conterá informações sobre o arquivo enviado pelo Multer
        if (!req.file) {
            return res.status(400).send('Nenhum arquivo foi enviado.');
        }

        const filePath = req.file.path; // Caminho onde o arquivo foi salvo

        try {
            // Chama o método do serviço para processar a planilha e obter o relatório
            const aiReport = await this.financeService.processPlanilhaAndAnalyze(filePath);

            // Envia o relatório da IA de volta como resposta JSON
            res.status(200).json({
                message: 'Análise da planilha concluída!',
                filename: req.file.originalname,
                report: aiReport // Enviando o relatório da IA
            });

        } catch (error) {
            console.error('Erro no controller de upload:', error);
            // Envia uma resposta de erro mais detalhada em modo de desenvolvimento
            if (process.env.NODE_ENV !== 'production') {
                 res.status(500).json({
                    message: 'Erro ao processar a planilha ou interagir com a IA.',
                    error: error.message,
                    stack: error.stack
                });
            } else {
                res.status(500).send('Erro ao processar a planilha.');
            }
        }
    }

    /**
     * Lida com as mensagens de chat.
     * @param {object} req - O objeto de requisição do Express.
     * @param {object} res - O objeto de resposta do Express.
     */
    async handleChat(req, res) {
        const userMessage = req.body.message; // Obtém a mensagem do corpo da requisição JSON

        try {
            // Chama o método do serviço para enviar a mensagem para a IA e obter a resposta
            const aiReply = await this.financeService.sendChatMessageToAI(userMessage);

            // Envia a resposta da IA de volta para o frontend
            res.status(200).json({ reply: aiReply });

        } catch (error) {
            console.error('Erro no controller de chat:', error);
            // Verifica se o erro é sobre a sessão de chat não iniciada
            if (error.message.includes('Sessão de chat não iniciada')) {
                 res.status(400).json({ reply: error.message });
            } else {
                // Envia uma resposta de erro mais detalhada em modo de desenvolvimento
                if (process.env.NODE_ENV !== 'production') {
                    res.status(500).json({
                        reply: 'Desculpe, ocorreu um erro ao processar sua mensagem no chat.',
                        error: error.message,
                        stack: error.stack
                    });
                } else {
                     res.status(500).json({ reply: 'Desculpe, ocorreu um erro ao processar sua mensagem no chat.' });
                }
            }
        }
    }
}

// Exporta uma instância da classe como export default, injetando a dependência do serviço
export default new FinanceController(financeService);
