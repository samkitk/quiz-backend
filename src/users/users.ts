import { auth0_management_client } from "../helper/auth0_helper";
import { hashIt } from "../helper/hash";
import { prisma } from "../helper/prisma_helper";

export async function createUser(email: string, password: string) {
  // TODO: email validation

  try {
    const createUserResponse = await auth0_management_client.createUser({
      email: email,
      password: password,
      connection: process.env.AUTH0_REALM,
    });

    if (createUserResponse) {
      const newUser = await prisma.user.create({
        data: {
          email: createUserResponse.email,
          auth0_user_id: createUserResponse.user_id,
          created_at: createUserResponse.created_at,
          name: createUserResponse.name,
          password: await hashIt(password),
        },
      });
      return newUser;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
