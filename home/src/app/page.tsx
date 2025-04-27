
'use client';

import { useState } from 'react';

interface VideoInfo {
  title: string;
  url: string;
  views: string;
  publishedAt: string;
  description: string;
  likes: string;
  comments: string;
}

interface ChannelData {
  channelName: string;
  channelDescription: string;
  channelUrl: string;
  videos: VideoInfo[];
}

export default function HomePage() {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChannelData | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result: ChannelData = await response.json();
      setData(result);

    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">YouTube Channel Scraper</h1>
      <p className="mb-8 text-gray-600 text-center max-w-lg">
        Insira a URL de um canal do YouTube (ex: https://www.youtube.com/@nomedocanal ou https://www.youtube.com/channel/UC...) para extrair informações sobre os vídeos mais recentes.
      </p>

      <div className="w-full max-w-md mb-8">
        <input
          type="text"
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
          placeholder="URL do Canal do YouTube"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={handleScrape}
          disabled={loading || !channelUrl}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Buscando...' : 'Buscar Informações'}
        </button>
      </div>

      {error && (
        <div className="w-full max-w-4xl p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span className="font-medium">Erro!</span> {error}
        </div>
      )}

      {data && (
        <div className="w-full max-w-6xl mt-8">
          <h2 className="text-2xl font-semibold mb-2 text-gray-700">Resultados para: <a href={data.channelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{data.channelName}</a></h2>
          <p className="text-gray-600 mb-6 italic">{data.channelDescription}</p>
          
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">Título do Vídeo</th>
                  <th scope="col" className="px-6 py-3">Data Postagem</th>
                  <th scope="col" className="px-6 py-3">Views</th>
                  <th scope="col" className="px-6 py-3">Likes</th>
                  <th scope="col" className="px-6 py-3">Comentários</th>
                  {/* <th scope="col" className="px-6 py-3">Descrição</th> */}
                </tr>
              </thead>
              <tbody>
                {data.videos.map((video, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" title={video.description || video.title}>
                        {video.title}
                      </a>
                    </td>
                    <td className="px-6 py-4">{video.publishedAt}</td>
                    <td className="px-6 py-4">{video.views}</td>
                    <td className="px-6 py-4 text-gray-400 italic">{video.likes}</td>
                    <td className="px-6 py-4 text-gray-400 italic">{video.comments}</td>
                    {/* <td className="px-6 py-4 text-xs text-gray-600">{video.description}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.videos.length > 0 && data.videos[0].title === 'Não foi possível extrair vídeos' && (
             <div className="mt-4 p-4 text-sm text-orange-700 bg-orange-100 rounded-lg" role="alert">
                <span className="font-medium">Aviso:</span> {data.videos[0].description}
             </div>
          )}
           <p className="mt-4 text-xs text-gray-500 italic">Nota: Likes e comentários geralmente não estão disponíveis via scraping direto da página.</p>
        </div>
      )}
    </main>
  );
}

