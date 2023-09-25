export class SearchDTO {
  cursor?: string;
  limit?: number;
  keyword?: string;
  date?: string;
  constructor(query: any) {
    this.cursor = query?.cursor;
    this.limit = query?.limit;
    this.keyword = query?.keyword;
    this.date = query?.date;
  }
}
