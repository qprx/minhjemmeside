import prisma from "@/lib/prisma";
import router from "@/lib/router";
import { NextApiRequest, NextApiResponse } from "next";

// Udvid NextApiRequest til at inkludere Steam bruger
interface NextSteamAuthApiRequest extends NextApiRequest {
  user?: {
    id: string;
    displayName: string;
    photos: { value: string }[];
    identifier: string;
    provider: string;
  };
}

export default async function handler(
  req: NextSteamAuthApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metode ikke tilladt" });
  }

  // Sørg for at køre routeren og hente brugerens session
  await router.run(req, res);
  try {
    // Tjek om brugeren er logget ind
    if (!req.user) {
      return res.status(401).json({
        message: "Du skal være logget ind for at indsende en ansøgning.",
      });
    }

    const steamId = req.user.id;

    // Tjek om der allerede findes en ansøgning med status 'AFVENTER'
    const existingApplication = await prisma.application_Whitelist.findFirst({
      where: {
        steamId,
        status: "AFVENTER",
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "Du har allerede en ansøgning under behandling.",
      });
    }

    // Fortsæt med at oprette ansøgningen, hvis ingen eksisterende ansøgning findes
    const {
      name,
      age,
      discord,
      rpExperience,
      characterName,
      characterAge,
      characterBackground,
      rpDuration,
      otherServers,
      rpInterest,
      scenario1,
      scenario2,
      scenario3,
      ruleAdherence,
      techSetup,
      serverChoice,
      additionalInfo,
      rulesRead,
      techRequirements,
    } = req.body;

    const application = await prisma.application_Whitelist.create({
      data: {
        steamId,
        name,
        age,
        discord,
        rpExperience,
        characterName,
        characterAge,
        characterBackground,
        rpDuration,
        otherServers,
        rpInterest,
        scenario1,
        scenario2,
        scenario3,
        ruleAdherence,
        techSetup,
        serverChoice,
        additionalInfo,
        rulesRead,
        techRequirements,
        status: "AFVENTER", // Sæt status til 'AFVENTER' ved oprettelse
      },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("Fejl ved oprettelse af ansøgning:", error);
    res.status(500).json({ message: "Kunne ikke gemme ansøgningen" });
  }
}
