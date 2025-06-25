export interface Member {
  id: number;
  name: string;
  created_at: string;
}

export interface SessionMember extends Member {
  isPresenter: boolean;
}