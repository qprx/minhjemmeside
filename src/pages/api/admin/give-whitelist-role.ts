import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; // Husk at importere dit prisma-instance

const BOT_TOKEN =
  "MTMyMzM0Njk1NzQzOTA3NDQwNA.GeYo_D.SCvumFeO4Xx4X-7WWuc8vYYvme0q6Q7aFLy6yE";
const GUILD_ID = "1035588340478652457"; // Server ID
const WHITELIST_ROLE_ID = "1322996421561159702"; // Rolle ID for whitelist
const REJECTED_ROLE_ID = "1323344688937173105"; // Rolle ID for afvist

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Kun POST er tilladt." });
  }

  const { steamId, action } = req.body; // Modtager steamId og brugerens handling (accept/deny)

  if (!steamId || !action) {
    return res.status(400).json({ error: "Steam ID eller handling mangler." });
  }

  try {
    // 1. Find den seneste godkendte whitelist-ansøgning
    const approvedApplication = await prisma.application_Whitelist.findFirst({
      where: {
        steamId,
        status: "GODKENDT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!approvedApplication) {
      return res.status(404).json({
        error: "Ingen godkendt ansøgning fundet for denne bruger.",
      });
    }

    const discordUsername = approvedApplication.discord;
    console.log("Discord navn fundet:", discordUsername);

    // 2. Hent Discord brugerens ID
    const discordId = await getUserIdFromDiscord(discordUsername);

    // 3. Vælg rolle baseret på handling (accept eller deny)
    let roleIdToAssign = action === "accept" ? WHITELIST_ROLE_ID : REJECTED_ROLE_ID;

    // 4. Giv rollen til brugeren
    const discordResponse = await giveDiscordRole(discordId, roleIdToAssign);

    if (discordResponse.ok) {
      const successMessage =
        action === "accept"
          ? `Whitelist-rollen blev givet til ${discordUsername}`
          : `Afvist-rollen blev givet til ${discordUsername}`;

      return res.status(200).json({
        message: successMessage,
      });
    } else {
      const errorMessage = await discordResponse.json();
      console.error("Fejl fra Discord API:", errorMessage);
      return res.status(500).json({
        error: "Kunne ikke give rollen via Discord API",
        details: errorMessage,
      });
    }
  } catch (error) {
    console.error("Fejl ved tildeling af rolle:", error);
    return res.status(500).json({ error: "Kunne ikke give rolle." });
  }
}

// Funktion der henter Discord ID via brugernavn
async function getUserIdFromDiscord(username: string) {
  const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/members/search?query=${username}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
  });

  const data = await response.json();

  if (!response.ok || data.length === 0) {
    throw new Error("Kunne ikke finde Discord bruger.");
  }

  const user = data.find((u: any) => u.user.username === username);
  if (!user) {
    throw new Error("Brugeren blev ikke fundet.");
  }

  return user.user.id; // Returnerer det korrekte Discord ID
}

// Funktion der tilføjer rolle via Discord API
async function giveDiscordRole(discordId: string, roleId: string) {
  const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return response;
}
