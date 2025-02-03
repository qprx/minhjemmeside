import Navbar from "@/components/Navbar";
import router from "@/lib/router";
import { NextApiRequest, NextApiResponse } from "next";

import { SteamProfile } from "@/lib/passport";
import type { NextSteamAuthApiRequest } from "@/lib/router";
import { useEffect, useState } from "react";
import ApplicationForm from "./comps/Form";
export default function Whitelist({ user }: { user: SteamProfile }) {
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        if (user) {
            if (user.role === "ADMIN") {
                console.log("User is admin")
                setIsAdmin(true)
            }
        }
    }, [user])
    return (
        <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/baggrunde/hero.jpg')" }}>
            <div className="min-h-screen bg-black bg-opacity-60"> {/* This creates an overlay for better readability */}
                <Navbar user={user} isAdmin={isAdmin} />
                <ApplicationForm />
            </div>
        </div>
    )
}


export async function getServerSideProps({ req, res }: { req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);
    return { props: { user: req.user || null } };
}