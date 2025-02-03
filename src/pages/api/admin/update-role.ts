import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; // Import af Prisma klienten
import router from "@/lib/router";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Kun POST er tilladt." });
  }
  await router.run(req, res);

  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Adgang nægtet" });
  }

  const { userId, role } = req.body;

  if (!userId || !role) {
    return res
      .status(400)
      .json({ error: "userId og rolle skal angives." });
  }

  // Valider at rollen er gyldig (for at undgå fejl)
  const validRoles = ["NORMAL", "ADMIN", "WHITELIST"]; // Tilpas med dine roller
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Ugyldig rolle." });
  }

  try {
    // Opdater brugerens rolle i databasen
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });

    // Returner succes med brugerens nye data
    return res.status(200).json({
      message: "Brugerens rolle er blevet opdateret.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Fejl ved opdatering af rolle:", error);
    return res.status(500).json({
      error: "Kunne ikke opdatere brugerens rolle. Tjek om brugeren eksisterer.",
    });
  }
}
