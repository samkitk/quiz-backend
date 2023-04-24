import { auth0_management_client } from "../helper/auth0_helper";
import { hashIt } from "../helper/hash";
import { CreateUserResponse } from "../helper/interfaces";
import { prisma } from "../helper/prisma_helper";
import { validateEmail } from "../helper/validator";

export async function createUser(email: string, password: string) {
  let isEmailValid = await validateEmail(email);

  if (!isEmailValid) {
    console.log("Email is not valid");
    return null;
  }

  try {
    const createUserResponse: CreateUserResponse =
      await auth0_management_client.createUser({
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
    } else {
      console.log("User not created");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
