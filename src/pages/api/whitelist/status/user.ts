import prisma from "@/lib/prisma";
import router from "@/lib/router";
import { NextApiRequest, NextApiResponse } from "next";

// Udvid NextApiRequest til at inkludere bruger
import { SteamProfile } from "@/lib/passport"; // Ensure this import is correct

interface NextSteamAuthApiRequest extends NextApiRequest {
  user?: SteamProfile & {
    id: string;
    displayName: string;
    photos: { value: string }[];
  };
}

export default async function handler(
  req: NextSteamAuthApiRequest,
  res: NextApiResponse
) {
  // Kun GET-metode tilladt
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metode ikke tilladt" });
  }

  // Kør router for at hente bruger-session
  await router.run(req, res);

  try {
    // Tjek om brugeren er logget ind
    if (!req.user) {
      return res.status(401).json({
        message: "Du skal være logget ind for at se din ansøgningsstatus.",
      });
    }

    const steamId = req.user.id;

    // Find brugerens ansøgning
    const application = await prisma.application_Whitelist.findFirst({
      where: {
        steamId,
      },
    });

    // Hvis ansøgningen ikke findes
    if (!application) {
      return res.status(404).json({
        message: "Ingen ansøgning fundet for denne bruger.",
      });
    }

    // Returner ansøgningsstatus
    res.status(200).json(application);
  } catch (error) {
    console.error("Fejl ved hentning af ansøgningsstatus:", error);
    res.status(500).json({
      message: "Kunne ikke hente ansøgningsstatus.",
    });
  }
}
