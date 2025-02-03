import Image from 'next/image'
import { Users, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import ServerStatus from "@/components/ServerStatus";
import { useState } from 'react';

import router from "@/lib/router";
import { NextApiRequest, NextApiResponse } from "next";

import { SteamProfile } from "@/lib/passport";
import type { NextSteamAuthApiRequest } from "@/lib/router";
import { useEffect } from 'react';

export default function Home({ user }: { user: SteamProfile }) {
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        if (user) {
            console.log(JSON.stringify(user))
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

                {/* Hero Section */}
                <section className="text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl text-red-400">
                            Velkommen til Avanha RP
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl">
                            Stedet hvor du oplever en masse sjov og spænding
                        </p>
                    </div>
                </section>


                <section id="server-status" className="py-16 flex justify-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ServerStatus />
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-center mb-12 text-white">Hvorfor skal du vælge Avanha?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Users className="h-8 w-8" />}
                                title="Grund 1"
                                description="Fordi at vi har et moden staff 16+ vi vil slet ik have nogen magtmisbrugene staff"
                            />
                            <FeatureCard
                                icon={<Shield className="h-8 w-8" />}
                                title="Grund 2"
                                description="Fordi at vi har fede scripts til kriminele og politi og da massere af muligehedder for at starte et firma"
                            />
                            <FeatureCard
                                icon={<Zap className="h-8 w-8" />}
                                title="Grund 3"
                               description="Fordi at ogs for staff teamet aldrig vil stop et RP scniare alt vil blive taget på discord."
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-md backdrop-blur-sm">
        <div className="text-white mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-200">{description}</p>
    </div>
)


export async function getServerSideProps({ req, res }: { req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);
    return { props: { user: req.user || null } };
}