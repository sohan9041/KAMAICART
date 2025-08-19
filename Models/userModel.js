import { client } from "../Config/connectDb.js";

export const Register = async (name, email, phone, role, password) => {
  console.log("Registering user:", name, email, phone, role);

  const result = await client.query(
    `INSERT INTO admindata (name, email, phoneno, password,role)
       VALUES ($1, $2, $3, $4,$5)
RETURNING id, name, email, role`,
    [name, email, phone, password, role]
  );

  return result.rows[0];
};

export const findUserByEmailorPhone = async (identifier, client) => {
  let query = `
    SELECT * FROM admindata
    WHERE (email = $1 OR phoneno = $2)
  `;
  let values = [identifier, identifier];

  const result = await client.query(query, values);
  return result.rows[0];
};

export const Updatepassword = async (email, password, client) => {
  const result = await client.query(
    `UPDATE admindata SET password = $1 WHERE email = $2`,
    [password, email]
  );

  return result.rows[0];
};
