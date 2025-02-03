import prisma from "@/lib/prisma";
import passport from "passport";
import passportSteam from "passport-steam";

const SteamStrategy = passportSteam.Strategy;

export interface SteamProfile {
    displayName: string;
    id: string;
    identifier: string;
    photos: Image[];
    provider: string;
    role?: string;
    whitelisted?: boolean;  // Ny attribut til at gemme whitelist-status
}

interface Image {
    value: string;
}

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(async function (obj: SteamProfile, done) {
    try {
        // Hent den nyeste brugerinfo inkl. rolle og whitelist-status fra databasen
        const user = await prisma.user.findUnique({
            where: { steamId: obj.id },
        });

        if (user) {
            obj.role = user.role;

            // Tjek om brugeren har en godkendt whitelist ansøgning
            const application = await prisma.application_Whitelist.findFirst({
                where: {
                    steamId: obj.id,
                    status: "GODKENDT",
                },
            });

            obj.whitelisted = !!application;  // True hvis ansøgningen findes
            done(null, obj);
        } else {
            done(null, null);
        }
    } catch (error) {
        console.error("Fejl ved deserialisering af bruger:", error);
        done(error, null);
    }
});

passport.use(
    new SteamStrategy(
        {
            returnURL: `${process.env.DOMAIN}/api/auth/return`,
            realm: `${process.env.DOMAIN}`,
            apiKey: `${process.env.STEAM_API_KEY}`,
        },
        async (_: string, profile: SteamProfile, done: (arg0: string | null, arg1: SteamProfile) => any) => {
            try {
                let user = await prisma.user.findUnique({
                    where: { steamId: profile.id },
                });

                if (!user) {
                    // Opret ny bruger med standardrolle
                    user = await prisma.user.create({
                        data: {
                            steamId: profile.id,
                            displayName: profile.displayName,
                            avatar: profile.photos[0]?.value || "",
                            role: "NORMAL",
                        },
                    });
                    console.log("Ny bruger oprettet:", user);
                } else {
                    // Opdater eksisterende bruger
                    user = await prisma.user.update({
                        where: { steamId: profile.id },
                        data: {
                            displayName: profile.displayName,
                            avatar: profile.photos[0]?.value || "",
                            lastLogin: new Date(),
                        },
                    });
                    console.log("Eksisterende bruger opdateret:", user);
                }

                // Tjek for godkendt whitelist-ansøgning
                const application = await prisma.application_Whitelist.findFirst({
                    where: {
                        steamId: profile.id,
                        status: "GODKENDT",
                    },
                });

                // Gem whitelist-status i session
                profile.role = user.role;
                profile.whitelisted = !!application;

                return done(null, profile);
            } catch (error) {
                console.error("Fejl ved oprettelse/opdatering af bruger:", error);
                return done(error as string, profile);
            }
        }
    )
);

export default passport;
