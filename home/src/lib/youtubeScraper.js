/**
 * Módulo para extrair informações de canais do YouTube
 */
import axios from 'axios';
import cheerio from 'cheerio';

/**
 * Extrai informações dos vídeos mais recentes de um canal do YouTube
 * @param {string} channelUrl - URL do canal do YouTube
 * @returns {Promise<Array>} - Array com informações dos vídeos
 */
export async function scrapeYoutubeChannel(channelUrl) {
  try {
    // Adiciona '/videos' ao final da URL se não estiver presente
    if (!channelUrl.endsWith('/videos')) {
      channelUrl = channelUrl.endsWith('/')
        ? `${channelUrl}videos`
        : `${channelUrl}/videos`;
    }

    // Configura o user-agent para simular um navegador
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    };

    // Faz a requisição HTTP para a página do canal
    const response = await axios.get(channelUrl, { headers });
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extrai informações do canal
    const channelName = $('meta[property="og:title"]').attr('content') || 'Nome não encontrado';
    const channelDescription = $('meta[property="og:description"]').attr('content') || 'Descrição não encontrada';
    
    // Array para armazenar informações dos vídeos
    const videos = [];
    
    // Tenta extrair scripts que contêm dados JSON
    const scripts = $('script').toArray();
    let videoData = [];
    
    // Procura por dados de vídeo em scripts JSON
    for (const script of scripts) {
      const content = $(script).html() || '';
      if (content.includes('videoRenderer') || content.includes('gridVideoRenderer')) {
        try {
          // Tenta extrair dados JSON de diferentes formatos possíveis
          const jsonMatch = content.match(/var ytInitialData = (.+?);<\/script>/);
          if (jsonMatch && jsonMatch[1]) {
            const jsonData = JSON.parse(jsonMatch[1]);
            
            // Navega pela estrutura de dados para encontrar vídeos
            // Esta estrutura pode mudar, então tentamos diferentes caminhos
            const tabs = jsonData?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
            const videosTab = tabs.find(tab => 
              tab?.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url?.includes('/videos')
            );
            
            if (videosTab) {
              const items = videosTab?.tabRenderer?.content?.richGridRenderer?.contents || [];
              videoData = items
                .filter(item => item.richItemRenderer?.content?.videoRenderer)
                .map(item => item.richItemRenderer.content.videoRenderer);
            }
          }
        } catch (e) {
          console.error('Erro ao analisar JSON:', e);
        }
      }
    }
    
    // Se não conseguiu extrair via JSON, tenta extrair via HTML
    if (videoData.length === 0) {
      // Seleciona elementos de vídeo na página
      $('ytd-grid-video-renderer, ytd-video-renderer').each((i, elem) => {
        try {
          const title = $(elem).find('#video-title').text().trim();
          const url = $(elem).find('#video-title').attr('href');
          const views = $(elem).find('#metadata-line span:first-child').text().trim();
          const timeAgo = $(elem).find('#metadata-line span:nth-child(2)').text().trim();
          
          if (title && url) {
            videos.push({
              title,
              url: `https://www.youtube.com${url}`,
              views,
              publishedAt: timeAgo,
              description: 'Descrição não disponível via HTML',
              likes: 'Não disponível',
              comments: 'Não disponível'
            });
          }
        } catch (e) {
          console.error('Erro ao extrair dados de vídeo via HTML:', e);
        }
      });
    } else {
      // Processa dados extraídos via JSON
      for (const video of videoData) {
        try {
          const title = video.title?.runs?.[0]?.text || 'Título não disponível';
          const videoId = video.videoId;
          const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#';
          const viewCountText = video.viewCountText?.simpleText || video.viewCountText?.runs?.[0]?.text || 'Visualizações não disponíveis';
          const publishedTimeText = video.publishedTimeText?.simpleText || 'Data não disponível';
          const description = video.descriptionSnippet?.runs?.map(r => r.text).join('') || 'Descrição não disponível';
          
          videos.push({
            title,
            url,
            views: viewCountText,
            publishedAt: publishedTimeText,
            description,
            likes: 'Não disponível via scraping',
            comments: 'Não disponível via scraping'
          });
        } catch (e) {
          console.error('Erro ao processar dados de vídeo:', e);
        }
      }
    }
    
    return {
      channelName,
      channelDescription,
      channelUrl,
      videos: videos.length > 0 ? videos : [{ 
        title: 'Não foi possível extrair vídeos',
        url: '#',
        views: 'N/A',
        publishedAt: 'N/A',
        description: 'O YouTube pode estar bloqueando scraping neste canal',
        likes: 'N/A',
        comments: 'N/A'
      }]
    };
    
  } catch (error) {
    console.error('Erro ao fazer scraping do canal:', error);
    return {
      channelName: 'Erro ao acessar canal',
      channelDescription: 'Não foi possível acessar o canal',
      channelUrl,
      videos: [{
        title: 'Erro',
        url: '#',
        views: 'N/A',
        publishedAt: 'N/A',
        description: `Erro ao acessar o canal: ${error.message}`,
        likes: 'N/A',
        comments: 'N/A'
      }]
    };
  }
}

/**
 * Função para obter informações detalhadas de um vídeo específico
 * @param {string} videoUrl - URL do vídeo do YouTube
 * @returns {Promise<Object>} - Objeto com informações detalhadas do vídeo
 */
export async function scrapeVideoDetails(videoUrl) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    };

    const response = await axios.get(videoUrl, { headers });
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Tenta extrair mais informações detalhadas do vídeo
    const title = $('meta[property="og:title"]').attr('content') || 'Título não encontrado';
    const description = $('meta[property="og:description"]').attr('content') || 'Descrição não encontrada';
    const channelName = $('link[itemprop="name"]').attr('content') || 'Canal não encontrado';
    
    // Tenta extrair contagem de likes e comentários dos scripts
    let likes = 'Não disponível';
    let comments = 'Não disponível';
    
    const scripts = $('script').toArray();
    for (const script of scripts) {
      const content = $(script).html() || '';
      if (content.includes('"likeCount"') || content.includes('"commentCount"')) {
        try {
          // Tenta extrair contagem de likes
          const likesMatch = content.match(/"likeCount":\s*"(\d+)"/);
          if (likesMatch && likesMatch[1]) {
            likes = likesMatch[1];
          }
          
          // Tenta extrair contagem de comentários
          const commentsMatch = content.match(/"commentCount":\s*"(\d+)"/);
          if (commentsMatch && commentsMatch[1]) {
            comments = commentsMatch[1];
          }
        } catch (e) {
          console.error('Erro ao extrair likes/comentários:', e);
        }
      }
    }
    
    return {
      title,
      description,
      channelName,
      likes,
      comments
    };
  } catch (error) {
    console.error('Erro ao obter detalhes do vídeo:', error);
    return {
      title: 'Erro',
      description: `Erro ao acessar o vídeo: ${error.message}`,
      channelName: 'N/A',
      likes: 'N/A',
      comments: 'N/A'
    };
  }
}
