import { pool } from "../../config/db";
import bcrypt from "bcryptjs";

export const CreateUserService = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  const hashPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email, hashPassword, phone, role]
  );

  return result;
};

export const GetsUserService = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result;
};

export const GetUserService = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result;
};

export const UpdateUserService = async (
  payload: Record<string, unknown>,
  id: string
) => {
  const { name, email, password, phone, role } = payload;

  let hashPassword = null;

  if (password) {
    hashPassword = await bcrypt.hash(password as string, 10);
  }

  const result = await pool.query(
    `UPDATE users 
     SET name = $1, email = $2, password = COALESCE($3, password), phone = $4, role = $5
     WHERE id = $6 
     RETURNING *`,
    [name, email, hashPassword, phone, role, id]
  );

  return result;
};

export const DeleteUserService = async (id: string) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id]
  );
  return result;
};
