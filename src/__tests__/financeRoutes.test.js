// Importa o Express e o supertest para testar rotas HTTP
import express from 'express';
import request from 'supertest';
// Importa o roteador que vamos testar
import financeRoutes from '../routes/financeRoutes.js';
// Importa o controller para mocking
import FinanceController from '../controllers/financeController.js';
// Importa o Multer para mocking (precisamos mockar o middleware de upload)
import multer from 'multer';
// Importa path e fs para mocking na configuração do Multer se necessário,
// mas aqui mockaremos o Multer inteiro.
import path from 'path';
import fs from 'fs';


// Mocka o controller de finanças
jest.mock('../controllers/financeController.js', () => ({
  uploadPlanilha: jest.fn(), // Mocka o método uploadPlanilha
  handleChat: jest.fn(), // Mocka o método handleChat
}));

// Mocka o Multer para simular o comportamento de upload
jest.mock('multer', () => {
    const multer = jest.fn(() => ({
        single: jest.fn((fieldName) => (req, res, next) => {
            // Simula a adição de um arquivo mockado na requisição
            req.file = {
                fieldname: fieldName,
                originalname: 'mockfile.xlsx',
                encoding: '7bit',
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                size: 1024,
                destination: '/fake/uploads',
                filename: 'mockfile.xlsx',
                path: '/fake/uploads/mockfile.xlsx',
                buffer: Buffer.from('fake file content') // Adiciona um buffer mockado
            };
            next(); // Chama o próximo middleware/controller
        }),
        // Mocka outros métodos do Multer se forem usados (ex: array, fields)
    }));
     // Mocka a propriedade diskStorage se for acessada diretamente
    multer.diskStorage = jest.fn();
    return multer;
});

// Cria uma instância simples do aplicativo Express para testar as rotas
const app = express();
// Configura o Express para lidar com JSON (necessário para a rota de chat)
app.use(express.json());
// Usa o roteador de finanças
app.use('/', financeRoutes);

describe('FinanceRoutes', () => {

  // Limpa todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /upload', () => {
    test('deve chamar o controller.uploadPlanilha quando um arquivo é enviado', async () => {
      // Simula uma requisição POST com um arquivo
      const response = await request(app)
        .post('/upload')
        .attach('planilha', 'test/fixtures/fake_planilha.xlsx'); // Use um arquivo mockado ou real pequeno

      // Verifica se o controller.uploadPlanilha foi chamado
      expect(FinanceController.uploadPlanilha).toHaveBeenCalledTimes(1);
      // Verifica se a resposta tem status 200 (ou o status retornado pelo controller mockado)
      // Como o controller mockado não retorna nada por padrão, a resposta será 404 ou 500
      // Precisamos mockar o comportamento do controller para que ele envie uma resposta
      // Vamos mockar a implementação do controller.uploadPlanilha para simular uma resposta bem-sucedida
      FinanceController.uploadPlanilha.mockImplementation((req, res) => {
          res.status(200).json({ message: 'Upload mockado com sucesso' });
      });

      // Repete a requisição após mockar a implementação do controller
      const responseAfterMock = await request(app)
        .post('/upload')
        .attach('planilha', 'test/fixtures/fake_planilha.xlsx');

      expect(FinanceController.uploadPlanilha).toHaveBeenCalledTimes(2); // Chamado novamente
      expect(responseAfterMock.status).toBe(200);
      expect(responseAfterMock.body).toEqual({ message: 'Upload mockado com sucesso' });
    });

     test('deve retornar erro se nenhum arquivo for enviado (tratado pelo Multer/Controller)', async () => {
        // Simula uma requisição POST sem arquivo
        const response = await request(app)
            .post('/upload');

        // Verifica se o controller.uploadPlanilha foi chamado (Multer ainda pode chamar o controller)
        // Ou se o Multer/Controller retornou 400 diretamente
        // Vamos mockar o controller para retornar 400 se req.file for undefined
         FinanceController.uploadPlanilha.mockImplementation((req, res) => {
            if (!req.file) {
                res.status(400).send('Nenhum arquivo foi enviado.');
            } else {
                 res.status(200).json({ message: 'Upload mockado com sucesso' });
            }
        });

        const responseAfterMock = await request(app).post('/upload');

        expect(FinanceController.uploadPlanilha).toHaveBeenCalledTimes(1);
        expect(responseAfterMock.status).toBe(400);
        expect(responseAfterMock.text).toBe('Nenhum arquivo foi enviado.');
    });
  });

  describe('POST /chat', () => {
    test('deve chamar o controller.handleChat quando uma mensagem é enviada', async () => {
      const userMessage = 'Olá IA';
      const aiReply = 'Olá, como posso ajudar?';

      // Mocka a implementação do controller.handleChat para simular uma resposta
      FinanceController.handleChat.mockImplementation((req, res) => {
          res.status(200).json({ reply: aiReply });
      });

      // Simula uma requisição POST com um corpo JSON
      const response = await request(app)
        .post('/chat')
        .send({ message: userMessage });

      // Verifica se o controller.handleChat foi chamado
      expect(FinanceController.handleChat).toHaveBeenCalledTimes(1);
      // Verifica se a resposta tem status 200 e o JSON correto
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ reply: aiReply });
    });

     test('deve retornar erro se nenhuma mensagem for enviada (tratado pelo Controller)', async () => {
        // Mocka a implementação do controller.handleChat para retornar 400 se a mensagem for vazia
        FinanceController.handleChat.mockImplementation((req, res) => {
            if (!req.body || !req.body.message) {
                res.status(400).json({ reply: 'Mensagem vazia.' });
            } else {
                 res.status(200).json({ reply: 'Resposta mockada' });
            }
        });

        // Simula uma requisição POST com corpo JSON vazio
        const response = await request(app)
            .post('/chat')
            .send({});

        expect(FinanceController.handleChat).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ reply: 'Mensagem vazia.' });
    });
  });
});
