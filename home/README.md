# YouTube Channel Scraper

Este é um aplicativo web simples construído com Next.js que permite extrair (fazer scraping) informações sobre os vídeos mais recentes de um canal do YouTube.

## Funcionalidades

- Extrai o nome e a descrição do canal.
- Lista os vídeos mais recentes encontrados na página de vídeos do canal.
- Para cada vídeo, tenta extrair:
    - Título
    - URL
    - Data de postagem (aproximada, como "há 2 semanas")
    - Número de visualizações
    - Likes (geralmente indisponível via scraping)
    - Comentários (geralmente indisponível via scraping)
- Exibe os dados em uma tabela organizada.

## Como Usar (Versão Online Temporária)

1.  Acesse o link fornecido (o link é temporário e pode expirar).
2.  Insira a URL completa do canal do YouTube que deseja analisar no campo de entrada. Formatos aceitos:
    *   `https://www.youtube.com/@nomedocanal`
    *   `https://www.youtube.com/channel/ID_DO_CANAL`
3.  Clique no botão "Buscar Informações".
4.  Aguarde o processo de scraping (pode levar alguns segundos).
5.  Os resultados serão exibidos abaixo do formulário, incluindo o nome do canal, descrição e uma tabela com os detalhes dos vídeos.

## Limitações Importantes

*   **Proteções do YouTube:** O YouTube implementa medidas anti-scraping que podem mudar frequentemente. Isso significa que a ferramenta pode parar de funcionar ou funcionar de forma inconsistente para alguns canais ou em determinados momentos.
*   **Likes e Comentários:** Obter a contagem exata de likes e comentários geralmente requer acesso à API oficial do YouTube. O scraping direto da página raramente fornece esses dados de forma confiável, por isso eles aparecerão como "Não disponível" na maioria dos casos.
*   **Estrutura da Página:** A ferramenta depende da estrutura HTML e dos dados JSON incorporados na página do YouTube. Se o YouTube alterar significativamente o layout de suas páginas, o scraper pode precisar ser atualizado.
*   **Desempenho:** O tempo de extração pode variar dependendo da velocidade da conexão e da complexidade da página do canal.
*   **Apenas Vídeos Recentes:** A ferramenta foca nos vídeos listados na seção "Vídeos" do canal, que geralmente são os mais recentes.

## Estrutura do Projeto (Técnico)

- **Framework:** Next.js
- **Linguagem:** TypeScript
- **Scraping:**
    - `axios`: Para fazer requisições HTTP.
    - `cheerio`: Para analisar o HTML da página.
- **Arquivos Principais:**
    - `src/app/page.tsx`: Componente da página principal (interface do usuário).
    - `src/app/api/scrape/route.ts`: Rota da API que lida com as solicitações de scraping.
    - `src/lib/youtubeScraper.js`: Módulo contendo a lógica principal de scraping.

## Execução Local (Para Desenvolvedores)

1.  Clone o repositório (se aplicável).
2.  Navegue até o diretório do projeto: `cd youtube_scraper`
3.  Instale as dependências: `pnpm install`
4.  Inicie o servidor de desenvolvimento: `pnpm dev`
5.  Acesse `http://localhost:3000` (ou a porta indicada no console) no seu navegador.

