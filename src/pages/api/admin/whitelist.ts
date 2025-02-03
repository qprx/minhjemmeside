import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import router from "@/lib/router";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await router.run(req, res);

  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Adgang nægtet" });
  }

  try {
    const applications = await prisma.application_Whitelist.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Fejl ved hentning af ansøgninger" });
  }
}
