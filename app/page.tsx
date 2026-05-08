"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus } from "lucide-react";

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

  const isAdmin = user?.email === "admin@test.com";

  const [people, setPeople] = useState<Person[]>([]);
  const [blacklist, setBlacklist] = useState<Blacklist[]>([]);

  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [slot, setSlot] = useState("PREMIER");

  const [blName, setBlName] = useState("");
  const [blReason, setBlReason] = useState("");

  // ---------------- AUTH ----------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    loadPeople();
    loadBlacklist();
  }, []);

  // ---------------- LOAD ----------------
  async function loadPeople() {
    const { data } = await supabase.from("people").select("*");
    if (data) setPeople(data);
  }

  async function loadBlacklist() {
    const { data } = await supabase.from("blacklist").select("*");
    if (data) setBlacklist(data);
  }

  // ---------------- LIMIT (PREMIER) ----------------
  async function checkPremierLimit() {
    const { data } = await supabase
      .from("people")
      .select("*")
      .eq("slot", "PREMIER");

    return data?.length ?? 0;
  }

  // ---------------- ADD PERSON ----------------
  async function addPerson() {
    if (!name) return;

    if (slot === "PREMIER") {
      const count = await checkPremierLimit();
      if (count >= 1) {
        alert("❌ Już istnieje Premier!");
        return;
      }
    }

    await supabase.from("people").insert([
      { name, rank, position, department, slot },
    ]);

    setName("");
    setRank("");
    setPosition("");
    setDepartment("");

    loadPeople();
  }

  // ---------------- DELETE PERSON ----------------
  async function removePerson(id: string) {
    await supabase.from("people").delete().eq("id", id);
    loadPeople();
  }

  // ---------------- BLACKLIST ----------------
  async function addBlacklist() {
    await supabase
      .from("blacklist")
      .insert([{ name: blName, reason: blReason }]);

    setBlName("");
    setBlReason("");

    loadBlacklist();
  }

  async function removeBlacklist(id: string) {
    await supabase.from("blacklist").delete().eq("id", id);
    loadBlacklist();
  }

  // ---------------- UI ----------------
  const sections = [
    { title: "EAST MIDTOWN COMMAND", slots: ["OWNER", "OVERSIGHT"] },
    { title: "OFFICE OF THE PREMIER", slots: ["PREMIER", "DEPUTY_PREMIER"] },
    { title: "HIGH COMMAND", slots: ["GENERAL_SECRETARY", "DEPUTY_GENERAL_SECRETARY"] },
    { title: "MINISTERS OFFICE", slots: ["MINISTER", "DEPUTY_MINISTER"] },
    { title: "DIVISIONS", slots: ["SPECIAL_FORCES", "RED_GUARDS", "TANK_DIVISION", "CSS"] },
  ];

  return (
    <div className="bg-black text-white min-h-screen p-10">

      {/* LOGIN STATUS */}
      <div className="mb-5 text-zinc-400">
        {user ? `Zalogowany jako: ${user.email}` : "Nie zalogowany"}
      </div>

      <h1 className="text-4xl font-bold mb-10">
        EAST MIDTOWN CHAIN-OF-COMMAND
      </h1>

      {/* ADMIN PANEL */}
      {isAdmin && (
        <div className="bg-zinc-900 p-6 mb-10 rounded-xl">

          <h2 className="text-xl mb-4">➕ Dodaj osobę</h2>

          <div className="grid grid-cols-2 gap-3">

            <input placeholder="Nick" className="p-2 bg-black border"
              value={name} onChange={(e) => setName(e.target.value)} />

            <input placeholder="Ranga" className="p-2 bg-black border"
              value={rank} onChange={(e) => setRank(e.target.value)} />

            <input placeholder="Stanowisko" className="p-2 bg-black border"
              value={position} onChange={(e) => setPosition(e.target.value)} />

            <input placeholder="Department" className="p-2 bg-black border"
              value={department} onChange={(e) => setDepartment(e.target.value)} />

            <select className="p-2 bg-black border col-span-2"
              value={slot} onChange={(e) => setSlot(e.target.value)}>

              <option>OWNER</option>
              <option>OVERSIGHT</option>
              <option>PREMIER</option>
              <option>DEPUTY_PREMIER</option>
              <option>GENERAL_SECRETARY</option>
              <option>DEPUTY_GENERAL_SECRETARY</option>
              <option>MINISTER</option>
              <option>DEPUTY_MINISTER</option>
              <option>SPECIAL_FORCES</option>
              <option>RED_GUARDS</option>
              <option>TANK_DIVISION</option>
              <option>CSS</option>

            </select>

          </div>

          <button onClick={addPerson}
            className="mt-4 bg-white text-black px-4 py-2">
            Dodaj
          </button>
        </div>
      )}

      {/* CHAIN OF COMMAND */}
      {sections.map((sec) => (
        <div key={sec.title} className="mb-10">

          <h2 className="text-2xl font-bold mb-4">{sec.title}</h2>

          {sec.slots.map((slotName) => (
            <div key={slotName} className="mb-5">

              <h3 className="text-zinc-400 mb-2">
                {slotName.replaceAll("_", " ")}
              </h3>

              {people
                .filter((p) => p.slot === slotName)
                .map((p) => (
                  <div key={p.id}
                    className="bg-zinc-900 p-3 flex justify-between mb-2">

                    <div>
                      {p.position} - {p.name}
                    </div>

                    {isAdmin && (
                      <button onClick={() => removePerson(p.id)}>
                        <Trash2 />
                      </button>
                    )}

                  </div>
                ))}

            </div>
          ))}
        </div>
      ))}

      {/* BLACKLIST */}
      <div className="bg-red-900 p-5 rounded-xl mt-10">

        <h2 className="text-xl mb-3">🚫 BLACKLIST</h2>

        {isAdmin && (
          <div className="mb-4">
            <input placeholder="Nick"
              className="p-2 bg-black border mr-2"
              value={blName}
              onChange={(e) => setBlName(e.target.value)} />

            <input placeholder="Powód"
              className="p-2 bg-black border mr-2"
              value={blReason}
              onChange={(e) => setBlReason(e.target.value)} />

            <button onClick={addBlacklist}
              className="bg-black px-3 py-2">
              Dodaj
            </button>
          </div>
        )}

        {blacklist.map((b) => (
          <div key={b.id} className="flex justify-between">
            {b.name} - {b.reason}

            {isAdmin && (
              <button onClick={() => removeBlacklist(b.id)}>
                <Trash2 />
              </button>
            )}
          </div>
        ))}

      </div>

    </div>
  );
}