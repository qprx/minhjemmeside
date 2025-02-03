import prisma from "@/lib/prisma";
import router from "@/lib/router";
import { NextApiRequest, NextApiResponse } from "next";

// Udvid NextApiRequest til at inkludere Steam bruger
interface NextSteamAuthApiRequest extends NextApiRequest {
  user?: {
    id: string;
    displayName: string;
    role: string;  // Brugers rolle til autorisering
    identifier: string;
    photos: { value: string }[];
    provider: string;
  };
}

export default async function handler(
  req: NextSteamAuthApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metode ikke tilladt" });
  }

  await router.run(req, res);  // Kør router for at hente bruger-session

  // Tjek om brugeren er logget ind
  if (!req.user) {
    return res.status(401).json({ message: "Ikke logget ind" });
  }

  // Tjek om brugeren har rollen ADMIN
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Adgang nægtet. Du har ikke rettigheder." });
  }

  try {
    // Hent alle ansøgninger fra databasen
    const applications = await prisma.police_Application.findMany({
      orderBy: {
        createdAt: "desc",  // Sortér efter nyeste først
      },
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error("Fejl ved hentning af ansøgninger:", error);
    res.status(500).json({ message: "Kunne ikke hente ansøgninger." });
  }
}
