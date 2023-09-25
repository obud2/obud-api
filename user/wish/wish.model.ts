import { FootPrint } from '../dto/request/RequestBodyDTO';

export class Wish extends FootPrint {
  id: string;
  userId: string;
  studiosId: string;

  constructor(id: string, userId: string, studiosId: string, footPrint: FootPrint) {
    super(footPrint);
    this.id = id;
    this.userId = userId;
    this.studiosId = studiosId;
  }
}

export class GetWishList {
  cursor: string;
  limit: number;

  constructor(query: any) {
    this.cursor = query?.cursor || '';
    this.limit = query?.limit;
  }
}

export class StudiosShort {
  id: string;
  category: string[];
  images: object[];
  isShow: boolean;
  title: string;

  constructor(data: any) {
    this.id = data?.id.S;
    this.category = data.category.L.reduce((prev: string[], item: any) => {
      const list = prev;
      list.push(item.S);
      return list;
    }, []);
    this.images = data?.images.L.reduce((prev: any[], item: any) => {
      const list = prev;
      const to: any = {
        key: item.M.key.S,
        name: item.M.name.S,
        size: item.M.size.N,
        type: item.M.type.S,
        upload: item.M.upload.BOOL,
        url: item.M.url.S,
      };
      list.push(to);
      return list;
    }, []);
    this.isShow = data?.isShow.BOOL;
    this.title = data?.title.S;
  }
}
