// app/models/user.server.ts
import bcrypt from "bcrypt";

import { prisma } from "~/db.server";

export async function createUser(email: string, password: string, status = "active") {
  try {
    return await prisma.user.create({
      data: {
        email,
        password,
        status,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
}

export async function getUserById(id: number) {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error retrieving user by ID:", error);
    throw new Error("Failed to retrieve user.");
  }
}

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error("Error retrieving user by email:", error);
    throw new Error("Failed to retrieve user.");
  }
}

export async function updateUserStatus(id: number, status: string) {
  try {
    return await prisma.user.update({
      where: { id },
      data: { status },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error("Failed to update user status.");
  }
}

export async function deleteUser(id: number) {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user.");
  }
}

export async function verifyLogin(email: string, password: string) {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null; // User not found
    }

    // Compare the provided password with the stored hashed password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return null; // Password does not match
    }

    return user; // Successful login
  } catch (error) {
    console.error("Error during login verification:", error);
    throw new Error("Failed to verify login.");
  }
}
