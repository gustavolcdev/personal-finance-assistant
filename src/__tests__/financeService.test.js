// Importa o módulo fs com promises para mocking
import { promises as fs } from 'fs';
// Importa a biblioteca xlsx para mocking
import XLSX from 'xlsx';
// Importa o SDK do Google Generative AI para mocking
import { GoogleGenerativeAI } from '@google/generative-ai';
// Importa o serviço que vamos testar
import FinanceService from '../services/financeService.js';

// Mocka as dependências
jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn(), // Mocka a função unlink
  },
}));

jest.mock('xlsx', () => ({
  readFile: jest.fn(), // Mocka a função readFile
  utils: {
    sheet_to_json: jest.fn(), // Mocka a função sheet_to_json
  },
}));

// Mocka a GoogleGenerativeAI e seus métodos
const mockGenerateContent = jest.fn();
const mockSendMessage = jest.fn();
const mockStartChat = jest.fn(() => ({
  sendMessage: mockSendMessage,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: mockGenerateContent,
      startChat: mockStartChat,
    })),
  })),
}));

// Define a chave da API no ambiente de teste
process.env.GOOGLE_API_KEY = 'fake-api-key';

describe('FinanceService', () => {
  let financeService;

  // Antes de cada teste, cria uma nova instância do serviço
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    // Cria uma nova instância do serviço
    financeService = new FinanceService();
  });

  describe('processPlanilhaAndAnalyze', () => {
    const mockFilePath = '/fake/path/to/planilha.xlsx';
    const mockJsonData = [{ Coluna1: 'Valor1', Coluna2: 'Valor2' }];
    const mockAiReport = 'Relatório de Análise Financeira';
    const mockWorkbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } };

    // Configura os mocks para um cenário de sucesso
    beforeEach(() => {
      XLSX.readFile.mockReturnValue(mockWorkbook);
      XLSX.utils.sheet_to_json.mockReturnValue(mockJsonData);
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockAiReport,
        },
      });
    });

    test('deve processar a planilha, chamar a IA e retornar o relatório', async () => {
      const report = await financeService.processPlanilhaAndAnalyze(mockFilePath);

      // Verifica se as funções de leitura e conversão foram chamadas corretamente
      expect(XLSX.readFile).toHaveBeenCalledWith(mockFilePath);
      expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(mockWorkbook, { raw: false });

      // Verifica se a IA foi chamada com o prompt correto
      const expectedPrompt = expect.stringContaining(JSON.stringify(mockJsonData, null, 2));
      expect(mockGenerateContent).toHaveBeenCalledWith(expectedPrompt);

      // Verifica se a sessão de chat foi inicializada com o histórico correto
      expect(mockStartChat).toHaveBeenCalledWith({
        history: [
          {
            role: "user",
            parts: [{ text: `Com base no seguinte relatório financeiro, responda a perguntas do usuário sobre ele:\n\n${mockAiReport}`}]
          },
          {
            role: "model",
            parts: [{ text: "Ok, estou pronto para responder perguntas sobre o relatório financeiro."}]
          },
        ],
      });

      // Verifica se o relatório retornado é o esperado
      expect(report).toBe(mockAiReport);
    });

    test('deve lançar um erro se a leitura da planilha falhar', async () => {
      const readError = new Error('Erro ao ler arquivo');
      XLSX.readFile.mockImplementation(() => { throw readError; });

      await expect(financeService.processPlanilhaAndAnalyze(mockFilePath)).rejects.toThrow('Erro ao ler arquivo');
      expect(XLSX.utils.sheet_to_json).not.toHaveBeenCalled();
      expect(mockGenerateContent).not.toHaveBeenCalled();
      expect(mockStartChat).not.toHaveBeenCalled();
    });

    test('deve lançar um erro se a chamada da IA falhar', async () => {
      const aiError = new Error('Erro da IA');
      mockGenerateContent.mockRejectedValue(aiError);

      await expect(financeService.processPlanilhaAndAnalyze(mockFilePath)).rejects.toThrow('Erro da IA');
      expect(XLSX.readFile).toHaveBeenCalled();
      expect(XLSX.utils.sheet_to_json).toHaveBeenCalled();
      expect(mockStartChat).not.toHaveBeenCalled(); // Sessão de chat não deve ser iniciada
    });

    // Teste opcional para verificar se unlink é chamado (se a lógica de finally estiver ativa)
    // test('deve tentar remover o arquivo temporário no finally', async () => {
    //   await financeService.processPlanilhaAndAnalyze(mockFilePath);
    //   expect(fs.unlink).toHaveBeenCalledWith(mockFilePath);
    // });
  });

  describe('sendChatMessageToAI', () => {
    const userMessage = 'Qual foi meu maior gasto?';
    const aiReply = 'Seu maior gasto foi com...';

    // Configura os mocks para um cenário de sucesso no chat
    beforeEach(() => {
      // Inicializa uma sessão de chat mockada
      financeService.chatSession = {
        sendMessage: mockSendMessage,
      };
      mockSendMessage.mockResolvedValue({
        response: {
          text: () => aiReply,
        },
      });
    });

    test('deve enviar a mensagem para a sessão de chat e retornar a resposta', async () => {
      const reply = await financeService.sendChatMessageToAI(userMessage);

      // Verifica se sendMessage foi chamado com a mensagem do usuário
      expect(mockSendMessage).toHaveBeenCalledWith(userMessage);
      // Verifica se a resposta retornada é a esperada
      expect(reply).toBe(aiReply);
    });

    test('deve lançar um erro se não houver sessão de chat ativa', async () => {
      // Define a sessão de chat como nula
      financeService.chatSession = null;

      await expect(financeService.sendChatMessageToAI(userMessage)).rejects.toThrow('Sessão de chat não iniciada. Por favor, envie uma planilha primeiro.');
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test('deve lançar um erro se a mensagem for vazia', async () => {
        // Inicializa uma sessão de chat mockada
        financeService.chatSession = {
            sendMessage: mockSendMessage,
        };
        await expect(financeService.sendChatMessageToAI('')).rejects.toThrow('Mensagem vazia.');
        expect(mockSendMessage).not.toHaveBeenCalled();
    });


    test('deve lançar um erro se a chamada sendMessage falhar', async () => {
      const chatError = new Error('Erro no chat da IA');
      mockSendMessage.mockRejectedValue(chatError);

      await expect(financeService.sendChatMessageToAI(userMessage)).rejects.toThrow('Erro no chat da IA');
      expect(mockSendMessage).toHaveBeenCalledWith(userMessage);
    });
  });
});
