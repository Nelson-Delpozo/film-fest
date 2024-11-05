// app/models/respondent.server.ts
import { prisma } from "~/db.server"; // Adjust the path if your Prisma client is elsewhere

export async function createRespondent(email: string) {
  try {
    return await prisma.respondent.create({
      data: {
        email,
      },
    });
  } catch (error) {
    console.error("Error creating respondent:", error);
    throw new Error("Failed to create respondent.");
  }
}

export async function getRespondentById(id: number) {
  try {
    return await prisma.respondent.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error retrieving respondent:", error);
    throw new Error("Failed to retrieve respondent.");
  }
}

export async function getAllRespondents() {
  try {
    return await prisma.respondent.findMany();
  } catch (error) {
    console.error("Error retrieving respondents:", error);
    throw new Error("Failed to retrieve respondents.");
  }
}

export async function deleteRespondent(id: number) {
  try {
    return await prisma.respondent.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting respondent:", error);
    throw new Error("Failed to delete respondent.");
  }
}
