import axios from 'axios';

export interface Document {
      id: string,
      author: string,
      content: string,
      tags: string[],
      created: Date
}

export async function queryDocuments(tags: string[]): Promise<Document[]> {
  const response = await axios.post<Document[]>('api/document/query', { tags });

  if (response.status === 200) {

    response.data.forEach(doc => {
      doc.created = new Date(Date.parse((doc.created as any) as string))
    });

    return response.data;
  }
 
  throw new Error('Query documents failed');
}