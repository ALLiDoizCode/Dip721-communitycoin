export interface Proposal {
    id: number;
    vote?: boolean | null;
    creator: string;
    title: string;
    yay: number;
    description: string;
    timeStamp: number;
    treasuryRequestId?: number | null;
    executed: boolean;
    nay: number;
    request?: Request | null;
  }
  export interface Request {
    recipient: string;
    amount: number;
    description: string;
  }
  
  export interface Vote {
    yay: boolean;
    timeStamp: number;
    power: number;
    proposalId: number;
    member: string;
  }
  