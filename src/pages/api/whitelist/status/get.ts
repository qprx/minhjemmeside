import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metode ikke tilladt" });
  }

  try {
    // Hent alle ansøgningsstatusser
    const statuses = await prisma.applicationStatus.findMany();

    res.status(200).json(statuses);
  } catch (error) {
    console.error("Fejl ved hentning af ansøgningsstatus:", error);
    res.status(500).json({ message: "Kunne ikke hente ansøgningsstatus." });
  }
}
