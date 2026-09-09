import type { RowDataPacket } from "mysql2/promise";

export type LikedGenre = RowDataPacket & {
  ID_genre: number;
  name: string;
};
