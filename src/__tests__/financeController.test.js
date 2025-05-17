// Importa as funções e objetos necessários do Jest para ES Modules
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Importa o controller que vamos testar
import FinanceController from '../controllers/financeController.js';
// Importa o serviço para mocking
import FinanceService from '../services/financeService.js';

// Mocka o serviço de finanças
// Para ES Modules, quando o módulo exporta uma instância default (export default new Classe()),
// o mock deve retornar um objeto com uma propriedade 'default' que contém os mocks dos métodos da instância.
jest.mock('../services/financeService.js', () => {
  // Retorna um objeto que simula o módulo exportado
  return {
    default: { // Simula o export default da instância
      processPlanilhaAndAnalyze: jest.fn(), // Mocka o método processPlanilhaAndAnalyze
      sendChatMessageToAI: jest.fn(), // Mocka o método sendChatMessageToAI
    }
  };
});


// Mocka os objetos req e res do Express
const mockRequest = (body = {}, file = null) => ({
  body,
  file,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // Mocka status e retorna o próprio objeto para encadeamento
  res.json = jest.fn().mockReturnValue(res); // Mocka json e retorna o próprio objeto
  res.send = jest.fn().mockReturnValue(res); // Mocka send e retorna o próprio objeto
  return res;
};

describe('FinanceController', () => {
  let financeController;
  let req;
  let res;

  // Antes de cada teste, cria uma nova instância do controller e mocks de req/res
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    // Cria uma nova instância do controller, injetando o serviço mockado
    // Acessa o mock default do serviço
    financeController = new FinanceController(FinanceService.default);
    // Cria mocks de requisição e resposta
    req = mockRequest();
    res = mockResponse();
  });

  describe('uploadPlanilha', () => {
    const mockFile = { path: '/fake/path/to/upload.xlsx', originalname: 'planilha.xlsx' };
    const mockAiReport = 'Relatório de Análise Financeira Gerado';

    test('deve processar o upload, chamar o serviço e retornar o relatório', async () => {
      // Configura o mock do serviço para retornar um relatório
      FinanceService.default.processPlanilhaAndAnalyze.mockResolvedValue(mockAiReport); // Acessa o mock default
      req.file = mockFile; // Adiciona um arquivo mockado à requisição

      await financeController.uploadPlanilha(req, res);

      // Verifica se o serviço foi chamado com o caminho do arquivo
      expect(FinanceService.default.processPlanilhaAndAnalyze).toHaveBeenCalledWith(mockFile.path); // Acessa o mock default
      // Verifica se a resposta foi enviada com status 200 e o JSON correto
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Análise da planilha concluída!',
        filename: mockFile.originalname,
        report: mockAiReport,
      });
    });

    test('deve retornar status 400 se nenhum arquivo for enviado', async () => {
      req.file = undefined; // Simula nenhum arquivo enviado

      await financeController.uploadPlanilha(req, res);

      // Verifica se a resposta foi enviada com status 400 e a mensagem correta
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Nenhum arquivo foi enviado.');
      // Verifica se o serviço não foi chamado
      expect(FinanceService.default.processPlanilhaAndAnalyze).not.toHaveBeenCalled(); // Acessa o mock default
    });

    test('deve retornar status 500 e mensagem de erro se o serviço lançar um erro', async () => {
      const serviceError = new Error('Erro no serviço de processamento');
      FinanceService.default.processPlanilhaAndAnalyze.mockRejectedValue(serviceError); // Acessa o mock default
      req.file = mockFile; // Adiciona um arquivo mockado à requisição

      await financeController.uploadPlanilha(req, res);

      // Verifica se a resposta foi enviada com status 500
      expect(res.status).toHaveBeenCalledWith(500);
      // Em modo de desenvolvimento, verifica se o JSON de erro detalhado é enviado
      // (Assumindo que NODE_ENV não é 'production' no ambiente de teste)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: 'Erro ao processar a planilha ou interagir com a IA.',
          error: serviceError.message,
      }));
    });
  });

  describe('handleChat', () => {
    const userMessage = 'Qual a sugestão principal?';
    const aiReply = 'A sugestão principal é...';

    test('deve enviar a mensagem para o serviço de chat e retornar a resposta', async () => {
      // Configura o mock do serviço para retornar uma resposta
      FinanceService.default.sendChatMessageToAI.mockResolvedValue(aiReply); // Acessa o mock default
      req.body = { message: userMessage }; // Adiciona a mensagem do usuário ao corpo da requisição

      await financeController.handleChat(req, res);

      // Verifica se o serviço foi chamado com a mensagem do usuário
      expect(FinanceService.default.sendChatMessageToAI).toHaveBeenCalledWith(userMessage); // Acessa o mock default
      // Verifica se a resposta foi enviada com status 200 e o JSON correto
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ reply: aiReply });
    });

     test('deve retornar status 400 e mensagem de erro se o serviço indicar sessão não iniciada', async () => {
        const sessionError = new Error('Sessão de chat não iniciada. Por favor, envie uma planilha primeiro.');
        // Configura o mock do serviço para lançar um erro de sessão não iniciada
        FinanceService.default.sendChatMessageToAI.mockRejectedValue(sessionError); // Acessa o mock default
        req.body = { message: userMessage };

        await financeController.handleChat(req, res);

        // Verifica se a resposta foi enviada com status 400 e a mensagem correta
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ reply: sessionError.message });
        // Verifica se o serviço foi chamado
        expect(FinanceService.default.sendChatMessageToAI).toHaveBeenCalledWith(userMessage); // Acessa o mock default
    });


    test('deve retornar status 500 e mensagem de erro se o serviço de chat lançar um erro genérico', async () => {
      const chatServiceError = new Error('Erro interno no serviço de chat');
      FinanceService.default.sendChatMessageToAI.mockRejectedValue(chatServiceError); // Acessa o mock default
      req.body = { message: userMessage };

      await financeController.handleChat(req, res);

      // Verifica se a resposta foi enviada com status 500
      expect(res.status).toHaveBeenCalledWith(500);
       // Em modo de desenvolvimento, verifica se o JSON de erro detalhado é enviado
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          reply: 'Desculpe, ocorreu um erro ao processar sua mensagem no chat.',
          error: chatServiceError.message,
      }));
    });

     test('deve retornar status 400 se a mensagem do usuário for vazia', async () => {
        // Simula uma requisição com mensagem vazia
        req.body = { message: '' };

        await financeController.handleChat(req, res);

        // Verifica se a resposta foi enviada com status 400 e a mensagem correta
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ reply: 'Mensagem vazia.' });
        // Verifica se o serviço não foi chamado
        expect(FinanceService.default.sendChatMessageToAI).not.toHaveBeenCalled(); // Acessa o mock default
    });
  });
});
