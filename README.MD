Auxiliar de Finanças Pessoais 💰📊
==================================

Bem-vindo ao projeto Auxiliar de Finanças Pessoais! Este é um aplicativo web que utiliza Inteligência Artificial para analisar seus gastos e fornecer insights valiosos sobre sua saúde financeira.

* **Veja um video da interface e da execução do projeto** [LINK DO VIDEO AQUI](https://www.loom.com/share/c097c0fb1c194cb39bcec7867d642c6f?sid=3b57962a-795e-42e6-9079-89a9c627ff0b)

Sobre o Projeto ✨
-----------------

O objetivo deste projeto é ajudar os usuários a entenderem melhor seus hábitos de consumo, identificarem onde podem reduzir custos e traçarem metas para economizar e investir. A aplicação permite que o usuário faça upload de uma planilha com seus gastos, que é processada no backend e analisada por um agente de IA do Google. Após a análise, um relatório detalhado é apresentado, e um segundo agente de IA fica disponível em um chat para responder a dúvidas específicas sobre o relatório.

Funcionalidades Atuais ✅
------------------------

*   Upload de planilha de gastos (formatos .csv, .xls, .xlsx).
    
*   Processamento da planilha e conversão para JSON no backend.
    
*   Análise financeira da planilha por um agente de IA do Google.
    
*   Geração de um relatório detalhado com base na análise da IA.
    
*   Exibição do relatório formatado em Markdown na interface web.
    
*   Chat interativo com um segundo agente de IA para tirar dúvidas sobre o relatório.
    
*   Interface web responsiva com design moderno e animações.
    
*   Botão flutuante para iniciar uma nova análise.
    
*   Backend estruturado com princípios de Orientação a Objetos (Controllers, Services).
    
*   Utilização de ES Modules (import/export) no backend.
    
*   Testes unitários básicos para as camadas do backend.
    

Tecnologias Utilizadas 💻
-------------------------

**Backend:**

*   **Node.js:** Ambiente de execução JavaScript.
    
*   **Express:** Framework web para construir a API.
    
*   **Multer:** Middleware para lidar com upload de arquivos.
    
*   **XLSX:** Biblioteca para ler e processar arquivos de planilha.
    
*   **dotenv:** Para carregar variáveis de ambiente de um arquivo .env.
    
*   **@google/generative-ai:** SDK oficial para interagir com a API do Google AI Studio (Gemini).
    
*   **Jest:** Framework de testes JavaScript.
    
*   **Supertest:** Biblioteca para testar rotas HTTP.
    

**Frontend:**

*   **HTML5:** Estrutura da página web.
    
*   **CSS3:** Estilização e animações.
    
*   **JavaScript:** Lógica da interface, interações e chamadas de API.
    
*   **Marked:** Biblioteca para renderizar Markdown em HTML.
    

Instalação ⚙️
-------------

Siga os passos abaixo para configurar e rodar o projeto em sua máquina:

1.  git clone cd personal-finance-assistant_(Substitua pela URL real do seu repositório Git)_
    
2.  **É NECESSÁRIO QUE O NODE.JS v22.15.0 esteja instalado** 
    * npm install
    
3.  npm install --save-dev jest @jest/globals @types/jest supertest
    
4.  **Obtenha sua Chave de API do Google AI Studio:**
    
    *   Vá para o [Google AI Studio](https://aistudio.google.com/).
        
    *   Crie ou acesse um projeto.
        
    *   Obtenha sua chave de API.
        
5.  Crie o arquivo .env:
    
    *   Na raiz do projeto, crie um arquivo chamado .env.
        
    *   GOOGLE\_API\_KEY=SUA\_CHAVE\_DE\_API\_AQUI
        
        
Executando o Projeto ▶️
-----------------------

1.  O servidor deverá iniciar e informar em qual porta está rodando (geralmente http://localhost:3000).

    * Execute o comando npm start  para iniciar o servidor 
    
2.  **Acesse a aplicação no navegador:**
    
    *   Abra seu navegador e acesse o endereço fornecido pelo servidor (ex: http://localhost:3000).
        
3.  **Faça o upload da planilha:**
    
    *   Na interface, selecione uma planilha de gastos e clique em "Analisar Planilha".
        
    *   Aguarde a análise da IA. O relatório e a área de chat aparecerão.
        
4.  **Interaja no chat:**
    
    *   Use a área de chat para fazer perguntas sobre o relatório financeiro.
        
5.  **Inicie uma nova análise:**
    
    *   Clique no botão flutuante "+" no canto inferior direito para limpar a interface e iniciar uma nova análise.
        

Estrutura do Projeto 📁
-----------------------

A estrutura de pastas do projeto segue uma organização modular:
`   .  ├── node_modules/          # Dependências instaladas  ├── public/                # Arquivos estáticos (frontend)  │   ├── css/  │   │   └── style.css      # Estilos CSS  │   ├── js/  │   │   ├── actions/       # Funções de chamada de API  │   │   │   └── api.js  │   │   └── model/         # Lógica de manipulação da UI  │   │       └── UIManager.js  │   │   └── script.js      # Lógica principal do frontend  │   └── index.html         # Página principal da aplicação  ├── src/                   # Código fonte do backend  │   ├── controllers/       # Lógica de tratamento de requisições  │   │   └── financeController.js  │   ├── routes/            # Definição das rotas da API  │   │   └── financeRoutes.js  │   ├── services/          # Lógica de negócio e interação com IA  │   │   └── financeService.js  │   └── uploads/           # Diretório para arquivos de upload (criado na inicialização)  ├── __tests__/             # Arquivos de testes unitários  │   ├── financeController.test.js  │   ├── financeRoutes.test.js  │   └── financeService.test.js  ├── test/                  # Arquivos auxiliares para testes (ex: fixtures)  │   └── fixtures/  │       └── fake_planilha.xlsx # Arquivo de planilha mockado  ├── .env                   # Arquivo de variáveis de ambiente (chave da API)  ├── .gitignore             # Arquivos/pastas a serem ignorados pelo Git  ├── jest.config.js         # Configuração do Jest  └── package.json           # Gerenciador de pacotes e scripts   `

Testes 🧪
---------

* TODO

Melhorias Futuras 💡
--------------------

*   Implementar autenticação de usuário para gerenciar planilhas individuais.
    
*   Armazenar dados financeiros e relatórios em um banco de dados.
    
*   Adicionar mais opções de visualização de dados (gráficos, tabelas interativas).
    
*   Permitir que o usuário edite o relatório ou as sugestões da IA.
    
*   Explorar outros modelos ou funcionalidades da API do Google AI Studio.
    
*   Melhorar a interface de chat com histórico persistente e indicadores de digitação.
    
*   Adicionar validações mais robustas no upload e processamento da planilha.

*   Testes Unitários
    

Contribuindo 👋
---------------

Contribuições são bem-vindas! Se você tiver ideias ou melhorias, sinta-se à vontade para abrir uma issue ou enviar um Pull Request.

1.  Faça um fork do projeto.
    
2.  Crie uma branch para sua feature (git checkout -b feature/nova-feature).
    
3.  Faça commit das suas alterações (git commit -m 'Adiciona nova feature').
    
4.  Faça push para a branch (git push origin feature/nova-feature).
    
5.  Abra um Pull Request.
    

Licença 📄
----------

Este projeto está licenciado sob a Licença MIT. Veja o arquivo LICENSE para mais detalhes.

Desenvolvido com ❤️ durante a Imersão IA Alura + Google.