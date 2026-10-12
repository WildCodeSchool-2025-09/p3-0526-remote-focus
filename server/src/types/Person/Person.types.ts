import type { RowDataPacket } from "mysql2/promise";

export type PersonRow = RowDataPacket & {
  ID: number;
  name: string;
  photo: string | null;
  biography: string | null;
};
