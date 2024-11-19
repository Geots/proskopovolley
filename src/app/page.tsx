"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { createClient } from "../../utils/supabase/client";

interface Team {
  id: number;
  name: string;
  systimaName: string;
  points: number;
  matchesWon: number;
  matchesLost: number;
}

interface Match {
  id: number;
  location: string;
  date: string; // Assuming Supabase stores it as ISO string
  completed: boolean;
  winner: string;
  team1: string;
  team2: string;
  team1score: number;
  team2score: number;
  time: string;
}

function TeamCard({ team }: { team: Team }) {
  return (
    <li className="p-4 border-b hover:bg-orange-100 transition-all duration-200 ease-in-out">
      <div className="flex flex-col md:flex-row md:justify-between items-center">
        <span className="font-bold text-lg text-gray-800 md:w-1/3 text-center mb-2 md:mb-0">
          {team.name}
        </span>
        <span className="text-gray-500 text-sm md:text-base md:w-1/3 text-center mb-2 md:mb-0">
          {team.systimaName}
        </span>
        <div className="flex flex-row justify-center w-full md:w-1/3 space-x-4 mt-2 md:mt-0">
          <span className="text-gray-800">
            <strong>Points:</strong> {team.points}
          </span>
          <span className="text-gray-800">
            <strong>Won:</strong> {team.matchesWon}
          </span>
          <span className="text-gray-800">
            <strong>Lost:</strong> {team.matchesLost}
          </span>
        </div>
      </div>
    </li>
  );
}

function MatchCard({ match }: { match: Match }) {
  const formattedTime = new Date(match.date).toLocaleTimeString("el-GR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="p-4 border-b hover:bg-orange-100 transition-all duration-200 ease-in-out">
      <div className="flex flex-col md:flex-row md:justify-between items-center">
        <div className="font-bold text-2xl text-gray-800 md:w-1/4">
          {match.team1} vs {match.team2}
        </div>

        {match.completed ? (
          <div className="text-lg mt-2 md:w-1/3 text-center">
            <span className="text-gray-800">
              {match.team1}:{" "}
              <span className="font-semibold">{match.team1score}</span>
            </span>
            <span className="text-gray-800 ml-4">
              {match.team2}:{" "}
              <span className="font-semibold">{match.team2score}</span>
            </span>
            <div className="text-green-600 font-bold mt-2">
              Winner: {match.winner}
            </div>
          </div>
        ) : (
          <div className="text-blue-600 font-bold mt-2 md:w-1/3 text-center">
            Match Not Played Yet
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-center items-center w-full md:w-1/4 space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
          <span className="text-gray-500 text-sm md:text-base">
            {match.location}
          </span>
          <span className="text-gray-500 text-sm md:text-base">
            {new Date(match.date).toLocaleDateString("el-GR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="text-gray-500 text-sm md:text-base">
            {formattedTime}
          </span>
        </div>
      </div>
    </li>
  );
}

export default function Home() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const supabase = createClient();
        const { data: teams, error } = await supabase
          .from("teams")
          .select("*")
          .order("points", { ascending: false });

        if (error) throw error;
        setTeams(teams);
      } catch (err: any) {
        setError("Failed to load teams. Please try again.");
        console.error("Error fetching teams:", err.message);
      }
    };

    const fetchMatches = async () => {
      try {
        const supabase = createClient();
        const { data: matches, error } = await supabase
          .from("matches")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;
        setMatches(matches);
      } catch (err: any) {
        setError("Failed to load matches. Please try again.");
        console.error("Error fetching matches:", err.message);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      setShowLoading(true);

      try {
        await Promise.all([fetchTeams(), fetchMatches()]);
      } finally {
        setLoading(false);
        // Wait for the loading to finish before fading out
        setTimeout(() => {
          setShowLoading(false); // Trigger fade-out after a slight delay
        }, 300); // You can adjust this delay (300ms) for smoother transition
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {showLoading && (
        <div
          className={`fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-100 z-50 transition-opacity duration-500 ${
            loading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <p className="text-xl text-gray-600" aria-live="polite">
            Φόρτωση δεδομένων...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
          <p className="text-xl text-red-600" role="alert" aria-live="polite">
            {error}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Προσπάθησε ξανά
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <Head>
            <title>Τουρνουά Βόλλει - Ανατολική Αττική</title>
            <meta
              name="description"
              content="Κατάταξη και αναλυτικά αποτελέσματα ομάδων για το Τουρνουά Βόλλει της Περιφέρειας Ανατολικής Αττικής."
            />
            <meta
              property="og:title"
              content="Τουρνουά Βόλλει - Περιφέρεια Ανατολικής Αττικής"
            />
            <meta
              property="og:description"
              content="Κατάταξη και πρόγραμμα αγώνων."
            />
          </Head>

          <div className="bg-orange-500 text-white text-center py-4 shadow-lg p-2">
            <h1 className="text-4xl font-extrabold">Τουρνουά Βόλλει</h1>
            <h2 className="text-3xl font-semibold">
              Περιφέρεια Ανατολικής Αττικής
            </h2>
            <h3 className="text-2xl">2024-2025</h3>
          </div>

          <main className="bg-gray-50 py-12">
            <div className="border-2 rounded-lg m-2 p-4 md:p-6 md:w-4/5 md:mx-auto">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Κατάταξη
                </h2>
                <p className="text-gray-600 mt-2">
                  Αναλυτικά αποτελέσματα των ομάδων
                </p>
              </div>
              {teams && teams.length > 0 ? (
                <ol>
                  {teams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </ol>
              ) : (
                <p className="text-center text-gray-500">
                  Δεν υπάρχουν ομάδες προς εμφάνιση.
                </p>
              )}
            </div>

            <div className="border-2 rounded-lg m-2 mt-16 p-4 md:p-6 md:w-4/5 md:mx-auto">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Αγώνες</h2>
                <p className="text-gray-600 mt-2">
                  Πρόγραμμα και αποτελέσματα αγώνων
                </p>
              </div>
              {matches && matches.length > 0 ? (
                <ol>
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </ol>
              ) : (
                <p className="text-center text-gray-500">
                  Δεν υπάρχουν αγώνες προς εμφάνιση.
                </p>
              )}
            </div>
          </main>
        </>
      )}
    </>
  );
}
