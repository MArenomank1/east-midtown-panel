"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const isAdmin =
    user?.email === "admin@test.com" ||
    user?.email === "holowniaprzemyslaw986@gmail.com";

  const [people, setPeople] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  const [blName, setBlName] = useState("");
  const [blReason, setBlReason] = useState("");

  const slots = [
    "OWNER",
    "OVERSIGHT",
    "PREMIER",
    "DEPUTY_PREMIER",
    "GENERAL_SECRETARY",
    "MINISTER",
    "CSS",
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    load();
  }, []);

  async function load() {
    const p = await supabase.from("people").select("*");
    const b = await supabase.from("blacklist").select("*");

    if (p.data) setPeople(p.data);
    if (b.data) setBlacklist(b.data);
  }

  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://east-midtown-panel-x9da.vercel.app",
      },
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function addPerson() {
    await supabase.from("people").insert([
      {
        name,
        position,
        slot: "PREMIER",
      },
    ]);

    setName("");
    setPosition("");
    load();
  }

  async function addBlacklist() {
    await supabase.from("blacklist").insert([
      { name: blName, reason: blReason },
    ]);

    setBlName("");
    setBlReason("");
    load();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">

      {/* SIDEBAR */}
      <div className="w-72 bg-[#0f0f0f] border-r border-zinc-800 p-5">
        <h1 className="text-xl font-bold mb-6">EAST MIDTOWN</h1>

        <div className="space-y-2">
          <button className="w-full p-3 bg-zinc-900 rounded-xl">
            🧭 COMMAND
          </button>
          <button className="w-full p-3 hover:bg-zinc-800 rounded-xl">
            📜 HISTORY
          </button>
          <button className="w-full p-3 hover:bg-zinc-800 rounded-xl">
            📊 RANK LIMITS
          </button>
          <button className="w-full p-3 hover:bg-red-900 rounded-xl">
            🚫 BLACKLIST
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="flex justify-between p-4 border-b border-zinc-800 bg-[#0f0f0f]">

          <input
            className="bg-black border border-zinc-800 px-3 py-2 rounded-xl w-96"
            placeholder="Search..."
          />

          {!user ? (
            <button onClick={login} className="bg-white text-black px-4 py-2 rounded-xl">
              LOGIN
            </button>
          ) : (
            <button onClick={logout} className="text-red-400">
              LOGOUT
            </button>
          )}

        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {/* ADD */}
          {isAdmin && (
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
              <h2 className="mb-3">➕ ADD PERSON</h2>

              <input
                className="w-full p-2 bg-black border mb-2"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full p-2 bg-black border mb-2"
                placeholder="Position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />

              <button onClick={addPerson} className="bg-white text-black px-4 py-2 rounded-xl">
                ADD
              </button>
            </div>
          )}

          {/* COMMAND LIST */}
          <div>
            <h2 className="text-xl mb-4">CHAIN OF COMMAND</h2>

            {slots.map((s) => (
              <div key={s} className="bg-[#111] p-4 rounded-2xl mb-4">
                <h3 className="text-zinc-400 mb-2">{s}</h3>

                {people.filter(p => p.slot === s).map(p => (
                  <div key={p.id} className="flex justify-between bg-black p-2 rounded-xl mb-2">
                    {p.position} - {p.name}

                    {isAdmin && (
                      <button onClick={() => supabase.from("people").delete().eq("id", p.id)}>
                        <Trash2 />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* BLACKLIST */}
          <div className="bg-red-950 border border-red-800 p-5 rounded-2xl">

            <h2 className="mb-3">🚫 BLACKLIST</h2>

            {isAdmin && (
              <div className="flex gap-2 mb-3">
                <input
                  className="p-2 bg-black border"
                  placeholder="Name"
                  value={blName}
                  onChange={(e) => setBlName(e.target.value)}
                />

                <input
                  className="p-2 bg-black border"
                  placeholder="Reason"
                  value={blReason}
                  onChange={(e) => setBlReason(e.target.value)}
                />

                <button onClick={addBlacklist} className="bg-black px-3 py-2 rounded-xl">
                  ADD
                </button>
              </div>
            )}

            {blacklist.map(b => (
              <div key={b.id} className="flex justify-between">
                {b.name} - {b.reason}
              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}