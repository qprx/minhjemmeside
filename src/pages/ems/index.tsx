import Navbar from "@/components/Navbar";
import router from "@/lib/router";
import { NextApiRequest, NextApiResponse } from "next";

import { SteamProfile } from "@/lib/passport";
import type { NextSteamAuthApiRequest } from "@/lib/router";
import { useEffect, useState } from "react";
import EMSApplicationForm from "./comps/Form";
export default function Politi({ user }: { user: SteamProfile }) {
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        if (user) {
            if (user.role === "ADMIN") {
                setIsAdmin(true)
            }
        }
    }, [user])


    if (!user.whitelisted) {
        return (
            <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/baggrunde/hero.jpg')" }}>
                <div className="min-h-screen bg-black bg-opacity-60"> {/* This creates an overlay for better readability */}
                    <Navbar user={user} isAdmin={isAdmin} />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl text-red-400 text-center mt-20">
                            Du skal være whitelisted for at kunne ansøge om politi
                        </h1>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/baggrunde/hero.jpg')" }}>
            <div className="min-h-screen bg-black bg-opacity-60"> {/* This creates an overlay for better readability */}
                <Navbar user={user} isAdmin={isAdmin} />
                <EMSApplicationForm />
            </div>
        </div>
    )
}


export async function getServerSideProps({ req, res }: { req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);
    return { props: { user: req.user || null } };
}