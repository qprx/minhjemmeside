import Navbar from "@/components/Navbar";
import router from "@/lib/router";
import { NextApiRequest, NextApiResponse } from "next";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface User {
  id: string;
  steamId: string;
  displayName: string;
  role: string;
  createdAt: string;
}

// Whitelist-ansøgning
interface WhitelistApp {
  id: string;
  steamId: string;
  name: string;
  age: string;
  discord: string;
  rpExperience?: string;
  characterName: string;
  characterAge: string;
  characterBackground: string;
  rpDuration: string;
  otherServers?: string;
  rpInterest: string;
  scenario1: string;
  scenario2: string;
  scenario3: string;
  ruleAdherence: string;
  techSetup?: string;
  serverChoice: string;
  additionalInfo?: string;
  rulesRead: boolean;
  techRequirements: boolean;
  createdAt: string;
  status: string;
}

// Politi-ansøgning
interface PoliceApp {
  id: string;
  steamId: string;
  name: string;
  age: number;
  discord: string;
  rpExperience?: string;
  characterName: string;
  characterAge: number;
  characterBackground: string;
  policeMotivation: string;
  goodPoliceQualities: string;
  balanceLawAndFun: string;
  scenario1: string;
  scenario2: string;
  scenario3: string;
  ruleAdherence: string;
  techSetup?: string;
  serverChoice: string;
  additionalInfo?: string;
  rulesRead: boolean;
  techRequirements: boolean;
  createdAt: string;
  status: string;
}

// EMS-ansøgning
interface EMsApp {
  id: string;
  steamId: string;
  name: string;
  age: number;
  discord: string;
  rpExperience?: string;
  characterName: string;
  characterAge: number;
  characterBackground: string;
  emsMotivation: string;         // OBS: Feltnavne her
  goodEmsQualities: string;
  ensureFunRP: string;
  scenario1: string;
  scenario2: string;
  scenario3: string;
  ruleAdherence: string;
  techSetup?: string;
  serverChoice: string;
  additionalInfo?: string;
  rulesRead: boolean;
  techRequirements: boolean;
  createdAt: string;
  status: string;
}

// Fælles Application-liste fra /api/admin/applications
interface Application {
  id: string;
  steamId: string;
  name: string;
  category: string; // fx "politi" eller "ems"
  status: string;
  createdAt: string;
}

type TabType = "users" | "whitelist" | "politi" | "ems";

// Udvid ApplicationType med "ems"
type ApplicationType = "whitelist" | "police" | "ems";

export default function AdminDashboard({ user }: { user: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistApp[]>([]);
  const [politiAnsogninger, setPolitiAnsogninger] = useState<PoliceApp[]>([]);
  const [emsAnsogninger, setEmsAnsogninger] = useState<EMsApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeTab, setActiveTab] = useState<TabType>("users");

  // -- Modal-state --
  const [showModal, setShowModal] = useState(false);
  // Hvilken ansøgning er aktuelt valgt til visning i modal’en?
  const [selectedApplication, setSelectedApplication] =
    useState<WhitelistApp | PoliceApp | EMsApp | null>(null);
  // Til at bestemme hvilken type ansøgning vi har åbnet
  const [selectedApplicationType, setSelectedApplicationType] =
    useState<ApplicationType | null>(null);

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      setIsAdmin(true);
      fetchAllData();
    } else {
      window.location.href = "/";
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      const usersRes = await fetch("/api/admin/users");
      const appsRes = await fetch("/api/admin/applications"); // Brugt til EMS-liste (category: "ems")
      const whitelistRes = await fetch("/api/admin/whitelist");
      const politiAnsogningerRes = await fetch("/api/politi/getAll");
      const emsAnsogningerRes = await fetch("/api/ems/getAll");

      if (
        !usersRes.ok ||
        !appsRes.ok ||
        !whitelistRes.ok ||
        !politiAnsogningerRes.ok ||
        !emsAnsogningerRes.ok
      ) {
        throw new Error("Kunne ikke hente data");
      }

      const usersData = await usersRes.json();
      const appsData = await appsRes.json();
      const whitelistData = await whitelistRes.json();
      const politiData = await politiAnsogningerRes.json();
      const emsAnsogningerData = await emsAnsogningerRes.json();

      setUsers(usersData);
      setApplications(appsData); // Herunder EMS (category: "ems")
      setWhitelist(whitelistData);
      setPolitiAnsogninger(politiData);
      setEmsAnsogninger(emsAnsogningerData);
      setLoading(false);
    } catch (error) {
      Swal.fire({
        title: "Fejl",
        text: "Kunne ikke hente data fra serveren.",
        icon: "error",
      });
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        Swal.fire({
          title: "Opdateret",
          text: "Brugerens rolle er blevet opdateret.",
          icon: "success",
        });
        fetchAllData();
      } else {
        throw new Error("Kunne ikke opdatere rolle");
      }
    } catch (error) {
      Swal.fire({
        title: "Fejl",
        text: "Kunne ikke ændre brugerens rolle.",
        icon: "error",
      });
    }
  };

  // -- Åbn forskellige ansøgninger i modal --
  function openWhitelistApplication(app: WhitelistApp) {
    setSelectedApplication(app);
    setSelectedApplicationType("whitelist");
    setShowModal(true);
  }

  function openPoliceApplication(app: PoliceApp) {
    setSelectedApplication(app);
    setSelectedApplicationType("police");
    setShowModal(true);
  }

  // Tilføj en openEMSApplication
  function openEMSApplication(app: EMsApp) {
    setSelectedApplication(app);
    setSelectedApplicationType("ems");
    setShowModal(true);
  }

  async function deleteAnsogning(app: WhitelistApp | PoliceApp | EMsApp, type: string) {
    try {
      // Her bruger vi app.id og type (ems, police eller whitelist)
      const res = await fetch(`/api/admin/delete-application?appId=${app.id}&type=${type}`, {
        method: "DELETE",
      });
  
      if (!res.ok) {
        throw new Error("Fejl ved sletning af ansøgning.");
      }
  
      // Hvis alt gik godt
      console.log("Ansøgning slettet:", app.id);
      alert("Ansøgning slettet!");
      // Opdater state eller gen-hent data efterfølgende
    } catch (error) {
      console.error(error);
      alert("Kunne ikke slette ansøgningen.");
    }
  }
  

  function closeModal() {
    setShowModal(false);
    setSelectedApplication(null);
    setSelectedApplicationType(null);
  }

  // -- Godkend / Afvis ansøgning --
  async function handleUpdateStatus(
    selectedApplication: WhitelistApp | PoliceApp | EMsApp,
    applicationId: string,
    newStatus: string,
    type: ApplicationType,
    steamId?: string
  ) {
    try {
      console.log(JSON.stringify(selectedApplication))
      const res = await fetch(
        `/api/admin/update-application?appId=${applicationId}&type=${type}&status=${newStatus}`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Kunne ikke opdatere ansøgningsstatus");

      Swal.fire({
        title: "OK",
        text: `Ansøgning er nu ${newStatus}.`,
        icon: "success",
      });




      // Evt. whitelist-rolle-håndtering, hvis det er en whitelist-ansøgning
      if (newStatus === "GODKENDT" && type === "whitelist" && steamId) {
        const confirmResult = await Swal.fire({
          title: "Giv Whitelist Rolle?",
          text: "Vil du give brugeren en whitelist-rolle med det samme?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ja, giv whitelist",
          cancelButtonText: "Nej, giv afventer samtale",
        });

        const action = confirmResult.isConfirmed ? "accept" : "deny";
        await fetch("/api/admin/give-whitelist-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ steamId, action }),
        });
      }

      let discordname = selectedApplication.discord;
      await fetch("/api/admin/send-discord-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordname, newStatus, type }),
      });
      

      closeModal();
      fetchAllData();
    } catch (err) {
      Swal.fire({
        title: "Fejl",
        text: "Kunne ikke opdatere ansøgning.",
        icon: "error",
      });
    }
  }

  // -- Giv whitelist rolle (bruges ved whitelist-ansøgninger) --
  async function giveWhitelistRole(steamId: string) {
    try {
      const res = await fetch("/api/admin/give-whitelist-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ steamId }),
      });

      if (!res.ok) throw new Error("Kunne ikke give whitelist-rolle");

      Swal.fire({
        title: "Succes!",
        text: "Whitelist-rolle givet til brugeren.",
        icon: "success",
      });
    } catch (err) {
      Swal.fire({
        title: "Fejl",
        text: "Kunne ikke give whitelist-rolle.",
        icon: "error",
      });
    }
  }

  // -- Filter brugere baseret på søgning --
  const filteredUsers = users.filter((u) =>
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // EMS-ansøgninger hentet fra applications-listen (med category === "ems")
  const emsApps = applications.filter((app) => app.category === "ems");

  if (loading) {
    return <p className="text-center py-20">Indlæser dashboard...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar user={user} isAdmin={isAdmin} />
      <div className="max-w-7xl mx-auto py-12 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded ${activeTab === "users"
              ? "bg-gray-700"
              : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            Personer
          </button>

          <button
            onClick={() => setActiveTab("whitelist")}
            className={`px-4 py-2 rounded ${activeTab === "whitelist"
              ? "bg-gray-700"
              : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            Whitelist
          </button>

          <button
            onClick={() => setActiveTab("politi")}
            className={`px-4 py-2 rounded ${activeTab === "politi"
              ? "bg-gray-700"
              : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            Politi
          </button>

          <button
            onClick={() => setActiveTab("ems")}
            className={`px-4 py-2 rounded ${activeTab === "ems"
              ? "bg-gray-700"
              : "bg-gray-800 hover:bg-gray-700"
              }`}
          >
            EMS
          </button>
        </div>

        {/* Søgning (kun relevant for Personer) */}
        {activeTab === "users" && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Søg efter Steam navn..."
              className="w-auto p-3 rounded bg-gray-800 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* =============== USERS ============== */}
        {activeTab === "users" && (
          <div className="bg-gray-800 p-6 rounded-lg w-full">
            <h2 className="text-2xl font-semibold mb-6">Brugerliste</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Steam ID</th>
                  <th>Rolle</th>
                  <th>Oprettet</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.displayName}</td>
                    <td>{u.steamId}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-gray-700 p-2 rounded"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =============== WHITELIST ============== */}
        {activeTab === "whitelist" && (
          <div className="bg-gray-800 p-6 rounded-lg w-full">
            <h2 className="text-2xl font-semibold mb-6">
              Whitelist Ansøgninger
            </h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Steam ID</th>
                  <th>Status</th>
                  <th>Oprettet</th>
                  <th className="text-center">Handling</th>
                </tr>
              </thead>
              <tbody>
                {whitelist.map((app) => (
                  <tr key={app.id}>
                    <td>{app.name}</td>
                    <td>{app.steamId}</td>
                    <td>{app.status}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="text-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => openWhitelistApplication(app)}
                      >
                        Åben ansøgning
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => deleteAnsogning(app, "whitelist")}
                      >
                        Slet Ansøgning
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =============== POLITI ============== */}
        {activeTab === "politi" && (
          <div className="bg-gray-800 p-6 rounded-lg w-full">
            <h2 className="text-2xl font-semibold mb-4">Politi Ansøgninger</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Steam ID</th>
                  <th>Status</th>
                  <th>Oprettet</th>
                  <th className="text-center">Handling</th>
                </tr>
              </thead>
              <tbody>
                {politiAnsogninger.map((app) => (
                  <tr key={app.id}>
                    <td>{app.name}</td>
                    <td>{app.steamId}</td>
                    <td>{app.status}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="text-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => openPoliceApplication(app)}
                      >
                        Åben ansøgning
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => deleteAnsogning(app, "politi")}
                      >
                        Slet Ansøgning
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =============== EMS ============== */}
        {activeTab === "ems" && (
          <div className="bg-gray-800 p-6 rounded-lg w-full">
            <h2 className="text-2xl font-semibold mb-4">EMS Ansøgninger</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Steam ID</th>
                  <th>Status</th>
                  <th>Oprettet</th>
                  <th className="text-center">Handling</th>
                </tr>
              </thead>
              <tbody>
                {emsAnsogninger.map((app) => (
                  <tr key={app.id}>
                    <td>{app.name}</td>
                    <td>{app.steamId}</td>
                    <td>{app.status}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="text-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => openEMSApplication(app)}
                      >
                        Åben ansøgning
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
                        onClick={() => deleteAnsogning(app, "ems")}
                      >
                        Slet Ansøgning
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =============== MODAL ============== */}
      {showModal && selectedApplication && selectedApplicationType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-md w-11/12 max-w-2xl text-white relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={closeModal}
            >
              ✕
            </button>

            {/* Viser forskellige felter alt efter type */}
            {selectedApplicationType === "whitelist" && (
              <>
                <h2 className="text-2xl mb-4">
                  Whitelist ansøgning — {selectedApplication.name}
                </h2>
                {renderWhitelistData(selectedApplication as WhitelistApp)}
              </>
            )}

            {selectedApplicationType === "police" && (
              <>
                <h2 className="text-2xl mb-4">
                  Politi ansøgning — {selectedApplication.name}
                </h2>
                {renderPoliceData(selectedApplication as PoliceApp)}
              </>
            )}

            {selectedApplicationType === "ems" && (
              <>
                <h2 className="text-2xl mb-4">
                  EMS ansøgning — {selectedApplication.name}
                </h2>
                {renderEMSData(selectedApplication as EMsApp)}
              </>
            )}


            {/* Knapper for godkend/afvis */}
            <div className="flex space-x-4 mt-4">
              <button
                className="bg-green-600 px-4 py-2 rounded"
                onClick={() =>
                  handleUpdateStatus(
                    selectedApplication,
                    selectedApplication.id,
                    "GODKENDT",
                    selectedApplicationType,
                    selectedApplication.steamId
                  )
                }
              >
                Godkend
              </button>
              <button
                className="bg-red-600 px-4 py-2 rounded"
                onClick={() =>
                  handleUpdateStatus(
                    selectedApplication,
                    selectedApplication.id,
                    "AFVIST",
                    selectedApplicationType
                  )
                }
              >
                Afvis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 
 * Whitelist-detaljer
 */
function renderWhitelistData(app: WhitelistApp) {
  return (
    <div className="space-y-1 text-sm">
      <p><strong>Steam ID:</strong> {app.steamId}</p>
      <p><strong>Alder:</strong> {app.age}</p>
      <p><strong>Discord:</strong> {app.discord}</p>
      <p><strong>RP Erfaring:</strong> {app.rpExperience || "Ingen info"}</p>
      <p><strong>Karakter:</strong> {app.characterName}</p>
      <p><strong>Karakter Alder:</strong> {app.characterAge}</p>
      <p><strong>Baggrund:</strong> {app.characterBackground}</p>
      <p><strong>Scenario1:</strong> {app.scenario1}</p>
      <p><strong>Scenario2:</strong> {app.scenario2}</p>
      <p><strong>Scenario3:</strong> {app.scenario3}</p>
      <p><strong>Status:</strong> {app.status}</p>
      <p>
        <strong>Oprettet:</strong> {new Date(app.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

/** 
 * Politi-detaljer
 */
function renderPoliceData(app: PoliceApp) {
  return (
    <div className="space-y-1 text-sm">
      <p><strong>Steam ID:</strong> {app.steamId}</p>
      <p><strong>Alder:</strong> {app.age}</p>
      <p><strong>Discord:</strong> {app.discord}</p>
      <p><strong>RP Erfaring:</strong> {app.rpExperience || "Ingen info"}</p>
      <p><strong>Karakter Navn:</strong> {app.characterName}</p>
      <p><strong>Karakter Alder:</strong> {app.characterAge}</p>
      <p><strong>Baggrund:</strong> {app.characterBackground}</p>
      <p><strong>Motivation:</strong> {app.policeMotivation}</p>
      <p><strong>Gode Kvalifikationer:</strong> {app.goodPoliceQualities}</p>
      <p><strong>Balance (Lov & Sjov):</strong> {app.balanceLawAndFun}</p>
      <p><strong>Scenario1:</strong> {app.scenario1}</p>
      <p><strong>Scenario2:</strong> {app.scenario2}</p>
      <p><strong>Scenario3:</strong> {app.scenario3}</p>
      <p><strong>Status:</strong> {app.status}</p>
      <p>
        <strong>Oprettet:</strong> {new Date(app.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

/** 
 * EMS-detaljer
 */
function renderEMSData(app: EMsApp) {
  return (
    <div className="space-y-1 text-sm">
      <p><strong>Steam ID:</strong> {app.steamId}</p>
      <p><strong>Alder:</strong> {app.age}</p>
      <p><strong>Discord:</strong> {app.discord}</p>
      <p><strong>RP Erfaring:</strong> {app.rpExperience || "Ingen info"}</p>
      <p><strong>Karakter Navn:</strong> {app.characterName}</p>
      <p><strong>Karakter Alder:</strong> {app.characterAge}</p>
      <p><strong>Baggrund:</strong> {app.characterBackground}</p>
      <p><strong>Motivation (EMS):</strong> {app.emsMotivation}</p>
      <p><strong>Vigtige EMS-egenskaber:</strong> {app.goodEmsQualities}</p>
      <p><strong>Hvordan sikrer du sjovt RP?:</strong> {app.ensureFunRP}</p>
      <p><strong>Scenario1:</strong> {app.scenario1}</p>
      <p><strong>Scenario2:</strong> {app.scenario2}</p>
      <p><strong>Scenario3:</strong> {app.scenario3}</p>
      <p><strong>Status:</strong> {app.status}</p>
      <p>
        <strong>Oprettet:</strong> {new Date(app.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}


export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  await router.run(req, res);
  return { props: { user: req.user || null } };
}
