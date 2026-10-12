import type { RowDataPacket } from "mysql2/promise";

export type Genre = RowDataPacket & {
  id: number;
  name: string;
};

export type LikedGenre = Genre;
