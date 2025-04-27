import { scrapeYoutubeChannel } from "@/lib/youtubeScraper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { channelUrl } = await request.json();

    if (!channelUrl || typeof channelUrl !== "string") {
      return NextResponse.json(
        { error: "URL do canal inválida." },
        { status: 400 }
      );
    }

    // Validação básica da URL (pode ser melhorada)
    if (!channelUrl.includes("youtube.com/channel/") && !channelUrl.includes("youtube.com/@")) {
       return NextResponse.json(
        { error: "URL do canal do YouTube parece inválida." },
        { status: 400 }
      );
    }

    console.log(`Iniciando scraping para: ${channelUrl}`);
    const data = await scrapeYoutubeChannel(channelUrl);
    console.log(`Scraping concluído para: ${channelUrl}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na API de scraping:", error);
    return NextResponse.json(
      { error: "Falha ao processar a solicitação de scraping." },
      { status: 500 }
    );
  }
}

