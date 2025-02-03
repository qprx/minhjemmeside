import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

interface ApplicationStatus {
    id: string;
    category: string;
    isOpen: boolean;
    updatedAt: string;
}

interface UserApplication {
    id: string;
    category: string;
    status: string;
    createdAt: string;
}

export default function ApplicationStatusPage() {
    const [statuses, setStatuses] = useState<ApplicationStatus[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userApplication, setUserApplication] = useState<UserApplication | null>(null);
    const [appLoading, setAppLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/whitelist/status/get");
                const data = await res.json();
                setStatuses(data);
                setLoading(false);
            } catch (error) {
                console.error("Kunne ikke hente status:", error);
                setLoading(false);
            }
        };

        const fetchUserApplication = async () => {
            try {
                const res = await fetch("/api/whitelist/status/user");
                const data = await res.json();

                if (res.ok) {
                    setUserApplication(data);
                }
            } catch (error) {
                console.error("Kunne ikke hente ansøgningsstatus:", error);
            } finally {
                setAppLoading(false);
            }
        };

        fetchStatus();
        fetchUserApplication();
    }, []);


    // Funktion til at mappe kategori til den korrekte route
    const mapCategoryToRoute = (category: string) => {
        switch (category.toLowerCase()) {
            case "police":
                return "politi";
            case "ems":
                return "ems";
            default:
                return category.toLowerCase();
        }
    };

    // Funktion til at mappe category til dansk
    const getCategoryLabel = (category: string) => {
        switch (category.toLowerCase()) {
            case "police":
                return "Politi";
            case "ems":
                return "Læge";
            case "whitelist":
                return "Whitelist";
            default:
                return category;
        }
    };

    // Tjek brugerens ansøgningsstatus
    const checkApplicationStatus = async (category: string) => {
        try {
            const res = await fetch("/api/whitelist/status/user");
            const data = await res.json();
    
            if (res.ok) {
                if (data.status === "GODKENDT") {
                    const route = mapCategoryToRoute(category);
                    router.push(`/${route}`);
                } else if (data.status === "AFVENTER") {
                    Swal.fire({
                        title: "Afventer",
                        text: "Din ansøgning afventer stadig godkendelse. Du kan ikke tilgå denne sektion endnu.",
                        icon: "info",
                        confirmButtonText: "Okay",
                    });
                } else {
                    Swal.fire({
                        title: "Adgang nægtet!",
                        text: "Du skal have en godkendt ansøgning for at tilgå denne sektion.",
                        icon: "error",
                        confirmButtonText: "Okay",
                    });
                }
            } else {
                // Hvis ingen aktiv ansøgning findes
                const route = mapCategoryToRoute(category);
                if (route === "whitelist") {
                    router.push(`/${route}`);
                } else {
                    Swal.fire({
                        title: "Adgang nægtet!",
                        text: "Du har ingen aktiv ansøgning.",
                        icon: "error",
                        confirmButtonText: "Okay",
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                title: "Fejl",
                text: "Kunne ikke hente din ansøgningsstatus. Prøv igen senere.",
                icon: "error",
                confirmButtonText: "Okay",
            });
        }
    };
    


    // Funktion til at route brugeren baseret på kategori
    const handleClick = (category: string, isOpen: boolean) => {
        if (isOpen) {
            const route = mapCategoryToRoute(category);
            if (route === "ems" || route === "politi" || route === "whitelist") {
                checkApplicationStatus(category);
            } else {
                router.push(`/${route}`);
            }
        } else {
            Swal.fire({
                title: "Lukket!",
                text: "Ansøgninger er lukket for denne kategori.",
                icon: "warning",
                confirmButtonText: "Okay",
            });
        }
    };
    

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-center text-red-400 mb-12">
                Ansøgningsstatus
            </h1>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                {statuses.map((status) => (
                    <div
                        key={status.id}
                        className={`transform hover:scale-105 transition-transform duration-300 rounded-xl shadow-lg overflow-hidden cursor-pointer ${status.isOpen
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : "bg-gradient-to-r from-red-400 to-red-600"
                            }`}
                        onClick={() => handleClick(status.category, status.isOpen)}
                    >
                        <div className="p-8">
                            <h2 className="text-3xl font-semibold text-white">
                                {getCategoryLabel(status.category)}
                            </h2>
                            <p className={`text-xl mt-4 ${status.isOpen ? "text-green-100" : "text-red-100"}`}>
                                {status.isOpen ? "Åben for ansøgninger" : "Lukket for ansøgninger"}
                            </p>
                            <p className="text-white mt-6 opacity-80">
                                Opdateret: {new Date(status.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vis brugerens ansøgningsstatus her */}
            <div className="mt-16 text-center">
                {appLoading ? (
                    <p>Indlæser ansøgningsstatus...</p>
                ) : userApplication ? (
                    <div className="bg-gray-200 rounded-lg inline-block px-6 py-4">
                        <p>
                            Status på Whitelist Ansøgning:{" "}
                            <strong>{userApplication.status}</strong>.
                        </p>
                    </div>
                ) : (
                    <p>Du har ingen aktiv ansøgning.</p>
                )}
            </div>

        </div>
    );
}
