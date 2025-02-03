import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import router from "@/lib/router";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await router.run(req, res);

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Kun DELETE-metoden er tilladt." });
  }


  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Adgang nægtet" });
  }

  const { appId, type } = req.query;

  if (!appId || !type) {
    return res.status(400).json({ error: "Mangler appId eller type." });
  }

  try {
    switch (type) {
      case "ems":
        // Hvis din EMS-model hedder EMSApplication i schema.prisma, 
        // så skal du matche navnet i Prisma-client
        await prisma.ems_application.delete({
          where: { id: String(appId) },
        });
        break;

      case "politi":
        await prisma.police_Application.delete({
          where: { id: String(appId) },
        });
        break;

      case "whitelist":
        await prisma.application_Whitelist.delete({
          where: { id: String(appId) },
        });
        break;

      default:
        return res
          .status(400)
          .json({ error: "Ukendt ansøgningstype (ems, police, whitelist)." });
    }

    return res.status(200).json({ message: "Ansøgning slettet." });
  } catch (error) {
    console.error("Fejl ved sletning af ansøgning:", error);
    return res.status(500).json({ error: "Intern serverfejl" });
  }
}
