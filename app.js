// Importa o módulo express
import express from 'express';
// Importa o módulo path para lidar com caminhos de arquivos
import path from 'path';
// Importa o dotenv para carregar variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
// Importa as rotas de finanças
import financeRoutes from './src/routes/financeRoutes.js'; // Note a extensão .js
// Importa fileURLToPath e dirname para obter __dirname em ES Modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Importa o módulo fs para operações de sistema de arquivos
import fs from 'fs';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Obtém o diretório atual em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cria uma instância do aplicativo Express
const app = express();
// Define a porta do servidor, usando a variável de ambiente PORT se disponível, caso contrário, usa 3000
const port = process.env.PORT || 3000;

// --- Garante que o diretório de uploads exista na inicialização ---
const uploadDir = path.join(__dirname, 'src', 'uploads');
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.error(`Erro ao criar o diretório de uploads em ${uploadDir}:`, err);
        // Dependendo da severidade, você pode querer sair do processo
        // process.exit(1);
    }
}
// --- Fim da verificação do diretório ---


// Configura o Express para servir arquivos estáticos da pasta 'public'
// Usa __dirname obtido corretamente para ES Modules
app.use(express.static(path.join(__dirname, 'public')));
// Permite que o Express lide com corpos de requisição JSON
app.use(express.json());

// Usa as rotas de finanças para os caminhos que começam com '/'
app.use('/', financeRoutes);

// Define uma rota para a página inicial ('/') que serve o index.html
// Esta rota é mantida para garantir que a página inicial seja servida.
// Usa __dirname obtido corretamente para ES Modules
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Inicia o servidor Express na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Certifique-se de ter um arquivo .env na raiz do projeto com GOOGLE_API_KEY=SUA_CHAVE_DE_API.`);
});
