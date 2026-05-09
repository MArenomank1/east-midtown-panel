"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

type Person = {
  id: string;
  name: string;
  rank: string;
  position: string;
  department: string;
  slot: string;
};

type Blacklist = {
  id: string;
  name: string;
  reason: string;
};

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState("command");

  const isAdmin =
    user?.email === "admin@test.com" ||
    user?.email === "holowniaprzemyslaw986@gmail.com";

  const [people, setPeople] = useState<Person[]>([]);
  const [blacklist, setBlacklist] = useState<Blacklist[]>([]);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [slot, setSlot] = useState("OWNER");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadPeople();
    loadBlacklist();
  }, []);

  async function loadPeople() {
    const { data } = await supabase.from("people").select("*");
    if (data) setPeople(data);
  }

  async function loadBlacklist() {
    const { data } = await supabase.from("blacklist").select("*");
    if (data) setBlacklist(data);
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
    if (!name) return;

    await supabase.from("people").insert([{ name, position, slot }]);

    setName("");
    setPosition("");
    loadPeople();
  }

  async function removePerson(id: string) {
    await supabase.from("people").delete().eq("id", id);
    loadPeople();
  }

  const command = [
    {
      title: "EAST MIDTOWN COMMAND",
      groups: [
        { title: "East Midtown Owner", slots: ["OWNER"] },
        { title: "Oversight Of East Midtown", slots: ["OVERSEER", "DEPUTY OVERSEER"] },
      ],
    },
    {
      title: "OFFICE OF THE PREMIER",
      groups: [
        { title: "Premier Of East Midtown", slots: ["PREMIER", "DEPUTY PREMIER"] },
      ],
    },
    {
      title: "HIGH COMMAND",
      groups: [
        { title: "General Secretary", slots: ["GENERAL SECRETARY", "DEPUTY GENERAL SECRETARY"] },
        { title: "Ministers Office", slots: ["MINISTER", "DEPUTY MINISTER"] },
      ],
    },
    {
      title: "DIVISIONS",
      groups: [
        { title: "Special Forces", slots: ["SPECIAL FORCES"] },
        { title: "Red Guards", slots: ["RED GUARDS"] },
        { title: "Tank Division", slots: ["4TH GUARDS TANK DIVISION"] },
        { title: "CSS", slots: ["CSS"] },
      ],
    },
  ];

  function Card({ title, children }: any) {
    return (
      <div className="bg-[#0b0b0b] border border-zinc-800 rounded-xl p-4 mb-4 shadow-lg">
        <h3 className="text-red-500 font-bold mb-3">{title}</h3>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#070707] border-r border-zinc-800 p-5">
        <h1 className="text-red-500 font-bold text-xl mb-6">
          EAST MIDTOWN
        </h1>

        <button onClick={() => setTab("command")} className="block mb-3 hover:text-red-400">
          COMMAND
        </button>
        <button onClick={() => setTab("history")} className="block mb-3 hover:text-red-400">
          CSS HISTORY
        </button>
        <button onClick={() => setTab("limits")} className="block mb-3 hover:text-red-400">
          RANK LIMITS
        </button>
        <button onClick={() => setTab("blacklist")} className="block hover:text-red-400">
          BLACKLIST
        </button>

        <div className="mt-10">
          {!user ? (
            <button onClick={login} className="bg-white text-black px-3 py-1 w-full">
              LOGIN
            </button>
          ) : (
            <button onClick={logout} className="text-red-400 w-full">
              LOGOUT
            </button>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* ADMIN ADD */}
        {isAdmin && (
          <div className="bg-[#0d0d0d] border border-zinc-800 p-4 rounded-xl mb-6">
            <h2 className="text-red-500 mb-3">ADD PERSON</h2>

            <input
              placeholder="Name"
              className="w-full mb-2 p-2 bg-black border"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Position"
              className="w-full mb-2 p-2 bg-black border"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />

            <select
              className="w-full mb-2 p-2 bg-black border"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              {[
                "OWNER",
                "OVERSEER",
                "DEPUTY OVERSEER",
                "PREMIER",
                "DEPUTY PREMIER",
                "GENERAL SECRETARY",
                "DEPUTY GENERAL SECRETARY",
                "MINISTER",
                "DEPUTY MINISTER",
                "SPECIAL FORCES",
                "RED GUARDS",
                "4TH GUARDS TANK DIVISION",
                "CSS",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <button onClick={addPerson} className="bg-red-600 w-full py-2">
              ADD
            </button>
          </div>
        )}

        {/* COMMAND UI */}
        {tab === "command" &&
          command.map((c) => (
            <div key={c.title} className="mb-6">
              <h2 className="text-xl text-red-500 font-bold mb-4">
                {c.title}
              </h2>

              {c.groups.map((g, i) => (
                <Card key={c.title + i} title={g.title}>
                  {people
                    .filter((p) => g.slots.includes(p.slot))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between bg-black border border-zinc-800 p-2 mb-2"
                      >
                        <div>
                          <div>{p.position}</div>
                          <div className="text-zinc-400 text-sm">{p.name}</div>
                        </div>

                        {isAdmin && (
                          <button onClick={() => removePerson(p.id)}>
                            <Trash2 className="text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                </Card>
              ))}
            </div>
          ))}

        {/* BLACKLIST */}
        {tab === "blacklist" && (
          <Card title="BLACKLIST">
            {blacklist.map((b) => (
              <div key={b.id} className="border-l border-red-600 pl-3 mb-2">
                {b.name} — {b.reason}
              </div>
            ))}
          </Card>
        )}

        {/* PLACEHOLDERS */}
        {tab === "history" && (
          <Card title="CSS HISTORY">
            <div className="text-zinc-500">Coming soon...</div>
          </Card>
        )}

        {tab === "limits" && (
          <Card title="RANK LIMITS">
            <div className="text-zinc-500">Coming soon...</div>
          </Card>
        )}

      </div>
    </div>
  );
}