import type { RowDataPacket } from "mysql2/promise";

export type LikedGenre = RowDataPacket & {
  id: number;
  name: string;
};
