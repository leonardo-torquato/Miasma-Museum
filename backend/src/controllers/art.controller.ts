import { Request, Response } from 'express';

export const getArts = async (req: Request, res: Response) => {
  try {
    // TODO: (Próximas Tarefas): 
    // 1. Checar se as artes estão no cache do Redis.
    // 2. Se não estiverem, fazer o fetch na API do museu.
    // 3. Tratar os dados e salvar no Redis.

    // Mock temporário para testar a rota e o container
    const mockArts = [
      { id: "art_001", title: "Retrato Clássico", imageUrl: "https://placeholder.com/art1.jpg" },
      { id: "art_002", title: "Paisagem Antiga", imageUrl: "https://placeholder.com/art2.jpg" }
    ];

    res.status(200).json({
      success: true,
      source: 'mock', // Útil para debugar depois se veio do 'cache' ou 'api'
      data: mockArts
    });

  } catch (error) {
    console.error("[Art Controller] Erro ao buscar obras de arte:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno no servidor ao processar as obras de arte." 
    });
  }
};