'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Swal from 'sweetalert2';
export default function ApplicationForm() {
    const [formData, setFormData] = useState({})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prevData => ({ ...prevData, [name]: value }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData(prevData => ({ ...prevData, [name]: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);

        try {
            const res = await fetch('/api/whitelist/send2/submit-application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                Swal.fire({
                    title: 'Ansøgning indsendt!',
                    text: 'Din ansøgning er blevet modtaget. Du hører fra os snart.',
                    icon: 'success',
                    confirmButtonText: 'Okay',
                });
                setFormData({});
            } else {
                const errorData = await res.json();
                Swal.fire({
                    title: 'Fejl!',
                    text: errorData.message || 'Noget gik galt ved indsendelsen.',
                    icon: 'error',
                    confirmButtonText: 'Prøv igen',
                });
            }
        } catch (error) {
            console.error('Fejl ved indsendelse:', error);
            Swal.fire({
                title: 'Serverfejl',
                text: 'Kunne ikke kontakte serveren. Prøv igen senere.',
                icon: 'error',
                confirmButtonText: 'Okay',
            });
        }
    };


    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="bg-red-600 py-6 px-4 sm:px-6">
                    <h2 className="text-3xl font-bold text-white text-center">Whitelist Ansøgning</h2>
                </div>
                <form onSubmit={handleSubmit} className="py-8 px-4 sm:px-6 space-y-8">
                    <section>
                        <h3 className="text-2xl font-semibold text-red-800 mb-4">Personlige oplysninger</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Navn:</label>
                                <Input type="text" id="name" name="name" onChange={handleInputChange} required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Alder:</label>
                                <Input type="number" id="age" name="age" onChange={handleInputChange} required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="discord" className="block text-sm font-medium text-gray-700">Discord-navn (inkl. #tag):</label>
                                <Input type="text" id="discord" name="discord" onChange={handleInputChange} required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="rpExperience" className="block text-sm font-medium text-gray-700">Tidligere erfaring med RP (hvis nogen):</label>
                                <Textarea id="rpExperience" name="rpExperience" onChange={handleInputChange} className="mt-1" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold text-red-800 mb-4">Din karakter</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="characterName" className="block text-sm font-medium text-gray-700">Karakterens fulde navn:</label>
                                <Input type="text" id="characterName" name="characterName" onChange={handleInputChange} required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="characterAge" className="block text-sm font-medium text-gray-700">Karakterens alder:</label>
                                <Input type="number" id="characterAge" name="characterAge" onChange={handleInputChange} required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="characterBackground" className="block text-sm font-medium text-gray-700">Kort baggrundshistorie om din karakter (minimum 50 ord):</label>
                                <Textarea id="characterBackground" name="characterBackground" onChange={handleInputChange} required className="mt-1" rows={4} />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold text-red-800 mb-4">RP-erfaring</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="rpDuration" className="block text-sm font-medium text-gray-700">Hvor længe har du spillet RP i alt?</label>
                                <Input type="text" id="rpDuration" name="rpDuration" onChange={handleInputChange} required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="otherServers" className="block text-sm font-medium text-gray-700">Har du spillet på andre FiveM-servere? Hvis ja, hvilke?</label>
                                <Textarea id="otherServers" name="otherServers" onChange={handleInputChange} className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="rpInterest" className="block text-sm font-medium text-gray-700">Hvilken type RP interesserer dig mest? (f.eks. politi, EMS, kriminel, civil):</label>
                                <Input type="text" id="rpInterest" name="rpInterest" onChange={handleInputChange} required className="mt-1" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold text-red-800 mb-4">Scenariebaserede spørgsmål</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="scenario1" className="block text-sm font-medium text-gray-700">Du er involveret i en uheldig situation, hvor en anden spiller bryder reglerne. Hvordan håndterer du det?</label>
                                <Textarea id="scenario1" name="scenario1" onChange={handleInputChange} required className="mt-1" rows={3} />
                            </div>
                            <div>
                                <label htmlFor="scenario2" className="block text-sm font-medium text-gray-700">Du bliver stoppet af politiet, men din karakter er skyldig i en forbrydelse. Hvordan vil du spille situationen ud?</label>
                                <Textarea id="scenario2" name="scenario2" onChange={handleInputChange} required className="mt-1" rows={3} />
                            </div>
                            <div>
                                <label htmlFor="scenario3" className="block text-sm font-medium text-gray-700">Forklar, hvordan du balancerer mellem sjov og realistisk RP:</label>
                                <Textarea id="scenario3" name="scenario3" onChange={handleInputChange} required className="mt-1" rows={3} />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold text-red-800 mb-4">Server-regler</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Checkbox id="rulesRead" name="rulesRead" onCheckedChange={(checked) => handleCheckboxChange({ target: { name: 'rulesRead', checked } } as any)} />
                                <label htmlFor="rulesRead" className="ml-2 block text-sm font-medium text-gray-700">
                                    Har du læst og forstået vores serverregler?
                                </label>
                            </div>
                            <div>
                                <label htmlFor="ruleAdherence" className="block text-sm font-medium text-gray-700">Hvordan vil du sikre dig, at du følger reglerne under spillet?</label>
                                <Textarea id="ruleAdherence" name="ruleAdherence" onChange={handleInputChange} required className="mt-1" rows={2} />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold text-red-800 mb-4">Teknisk</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Checkbox id="techRequirements" name="techRequirements" onCheckedChange={(checked) => handleCheckboxChange({ target: { name: 'techRequirements', checked } } as any)} />
                                <label htmlFor="techRequirements" className="ml-2 block text-sm font-medium text-gray-700">
                                    Har du en stabil internetforbindelse og en computer, der kan håndtere FiveM?
                                </label>
                            </div>
                            <div>
                                <label htmlFor="techSetup" className="block text-sm font-medium text-gray-700">Er der noget, vi bør vide om din opsætning, som kan påvirke dit spil?</label>
                                <Textarea id="techSetup" name="techSetup" onChange={handleInputChange} className="mt-1" rows={2} />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold text-red-800 mb-4">Ekstra</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="serverChoice" className="block text-sm font-medium text-gray-700">Hvorfor vil du gerne spille på Avanha?</label>
                                <Textarea id="serverChoice" name="serverChoice" onChange={handleInputChange} required className="mt-1" rows={3} />
                            </div>
                            <div>
                                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">Har du noget at tilføje, som vi bør vide om dig som spiller?</label>
                                <Textarea id="additionalInfo" name="additionalInfo" onChange={handleInputChange} className="mt-1" rows={3} />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold text-red-800 mb-4">Regler og forpligtelser</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700">Ved at indsende denne ansøgning accepterer du, at:</p>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                <li>Du overholder serverens regler og retningslinjer.</li>
                                <li>Du opfører dig respektfuldt over for andre spillere og admins.</li>
                                <li>Du deltager i serverens RP med en seriøs og positiv tilgang.</li>
                            </ul>
                        </div>
                    </section>

                    <div className="mt-8">
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                            Indsend ansøgning
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

