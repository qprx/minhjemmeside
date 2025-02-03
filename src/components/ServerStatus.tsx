import { useEffect, useState } from "react";
import { Server, Users, Clock, Link } from 'lucide-react';

interface ServerData {
  connect: string;
  endpoint: string;
  hostname: string;
  "last-seen": string;
  online: boolean;
  players: {
    count: number;
    list: string[];
    "self-reported": number;
  };
  private: boolean;
  slots: number;
}

export default function ServerStatus() {
  const [data, setData] = useState<ServerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("https://fivemapigo-production.up.railway.app/ebxyvp");
        if (!res.ok) {
          throw new Error(`Fetch fejlede med status: ${res.status}`);
        }
        const serverStatus: ServerData = await res.json();
        setData(serverStatus);
      } catch (err) {
        console.error(err);
        setError("Kunne ikke hente serverstatus");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // Hvis du vil tjekke serverstatus løbende (f.eks. hvert 30. sekund):
    // const intervalId = setInterval(() => fetchData(), 30000);
    // return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <div className="text-center p-4 text-gray-300">Indlæser serverstatus...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  // Her kan du i stedet for at returnere null, blot vise fallback-data (0/0).
  // Du kan også vælge at beholde if (!data) return null;, men så kommer du aldrig ned til "0/0"-visning.
  // Jeg viser her en simpel fallback-visning, hvis `data` er null.
  if (!data) {
    return (
      <div className="max-w-sm mx-auto bg-gray-800 shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="p-4 bg-red-400 rounded-t-lg">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Server className="mr-2" />
            Ingen serverdata
          </h2>
        </div>
        <div className="bg-white bg-opacity-10 p-6 rounded-b-lg shadow-md backdrop-blur-sm">
          <p className="text-lg font-semibold mb-2 text-red-400">Offline</p>
          <div className="space-y-2">
            <p className="flex items-center text-gray-400">
              <Users className="mr-2 text-gray-300" />
              Spillere: <span className="ml-1">0/0</span>
            </p>
            <p className="flex items-center text-gray-400">
              <Clock className="mr-2 text-gray-300" />
              Sidst Opdateret <span className="ml-1">Ukendt</span>
            </p>
            <p className="flex items-center text-gray-400">
              <Link className="mr-2 text-gray-300" />
              <span>Ingen server at forbinde til</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Hvis data IKKE er null, kan vi bruge optional chaining for at forhindre fejl,
  // og bruge fallback 0/0 hvis data.players.count eller data.slots er undefined/null.

  return (
    <div className="max-w-sm mx-auto bg-gray-800 shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <div className="p-4 bg-red-400 rounded-t-lg">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Server className="mr-2" />
          {data.hostname}
        </h2>
      </div>
      <div className="bg-white bg-opacity-10 p-6 rounded-b-lg shadow-md backdrop-blur-sm">
        <p
          className={`text-lg font-semibold mb-2 ${
            data.online ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {data.online ? 'Online' : 'Offline'}
        </p>
        <div className="space-y-2">
          <p className="flex items-center text-gray-400">
            <Users className="mr-2 text-gray-300" />
            Spillere:{' '}
            <span className="ml-1">
              {data.players?.count ?? 0}/{data.slots ?? 0}
            </span>
          </p>
          <p className="flex items-center text-gray-400">
            <Clock className="mr-2 text-gray-300" />
            Sidst Opdateret{' '}
            <span className="ml-1">
              {data['last-seen']
                ? new Date(data['last-seen']).toLocaleString()
                : 'Ukendt'}
            </span>
          </p>
          <p className="flex items-center text-gray-400">
            <Link className="mr-2 text-gray-300" />
            <a
              href={data.connect}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Forbind til serveren
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
