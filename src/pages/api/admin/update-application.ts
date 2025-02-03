import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; // Husk at importere dit prisma-instance
import { ApplicationStatus_Whitelist } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. POST only.' });
  }

  try {
    const { appId, type, status } = req.query;

    if (!appId || !type || !status) {
      return res.status(400).json({ error: 'Mangler data (appId, type, status)' });
    }

    // Tjek type
    if (type !== 'whitelist' && type !== 'police' && type !== 'ems') {
      return res.status(400).json({ error: 'Ugyldig ansøgningstype (forventer whitelist/police/ems).' });
    }

    switch (type) {
      case 'whitelist':
        // Bemærk modelnavnet: application_Whitelist
        await prisma.application_Whitelist.update({
          where: { id: appId as string },
          data: {
            // Her antager vi, at status skal være en streng,
            // der matcher enum ApplicationStatus_Whitelist
            status: status as ApplicationStatus_Whitelist,
          },
        });
        break;

      case 'police':
        // Bemærk modelnavnet: police_Application
        await prisma.police_Application.update({
          where: { id: appId as string },
          data: {
            status: status as ApplicationStatus_Whitelist,
          },
        });
        break;
      case 'ems':
        // Bemærk modelnavnet: ems_Application
        await prisma.ems_application.update({
          where: { id: appId as string },
          data: {
            status: status as ApplicationStatus_Whitelist,
          },
        });
        break;

      default:
        return res.status(400).json({ error: 'Ukendt type.' });
    }

    return res.status(200).json({ message: 'Ansøgningsstatus opdateret.' });
  } catch (error) {
    console.error('Fejl ved opdatering af ansøgningsstatus:', error);
    return res.status(500).json({ error: 'Intern serverfejl.' });
  }
}
