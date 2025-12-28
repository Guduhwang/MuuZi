export interface IAIEntity {
  id: string;
  persons: IPerson[];
}

export interface IPerson {
  id: string;
  name: string;
  img: string;
  msg?: string[];
}

export interface IGroup extends Eps.BaseGroupEntity {
  members: Eps.BaseGroupMemberEntity[];
}
