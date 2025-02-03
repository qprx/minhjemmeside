import Navbar from "@/components/Navbar";
import router from "@/lib/router";
import { NextApiRequest, NextApiResponse } from "next";
import { SteamProfile } from "@/lib/passport";
import type { NextSteamAuthApiRequest } from "@/lib/router";
import { useEffect, useState } from "react";

// Indlæser regler
import data from './regler.json';

export default function Whitelist({ user }: { user: SteamProfile }) {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user && user.role === "ADMIN") {
            console.log("User is admin");
            setIsAdmin(true);
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/baggrunde/hero.jpg')" }}>
            <div className="min-h-screen bg-black bg-opacity-60">
                <Navbar user={user} isAdmin={isAdmin} />
                
                <div className="container mx-auto py-16 px-6">
                    <h1 className="text-5xl text-white font-bold text-center mb-16">
                        {data.title}
                    </h1>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.sections.map((section, index) => (
                            <div key={index} className="bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition-all hover:scale-105">
                                <div className="bg-red-400 py-4 px-6">
                                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                                </div>
                                <div className="p-6">
                                    <ul className="list-disc list-inside text-gray-300 space-y-3">
                                        {section.rules.map((rule, idx) => (
                                            <li key={idx} className="leading-relaxed">{rule}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res }: { req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);
    return { props: { user: req.user || null } };
}
