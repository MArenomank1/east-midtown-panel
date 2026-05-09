"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  Trash2,
  Shield,
  Ban,
  Crown,
  Search,
  LogOut,
  Plus,
  BookText,
  Scale,
} from "lucide-react";

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

type HistoryItem = {
  id: string;
  title: string;
  content: string;
};

type RankLimit = {
  id: string;
  rank: string;
  limit_value: number;
};

export default function Page() {

  // ================= USER =================
  const [user, setUser] = useState<any>(null);

  const admins = [
    "holowniaprzemyslaw986@gmail.com",
  ];

  const isAdmin = admins.includes(user?.email || "");

  // ================= STATES =================
  const [activeTab, setActiveTab] = useState("command");

  const [people, setPeople] = useState<Person[]>([]);
  const [blacklist, setBlacklist] = useState<Blacklist[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [rankLimits, setRankLimits] = useState<RankLimit[]>([]);

  const [search, setSearch] = useState("");

  // PERSON
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [slot, setSlot] = useState("PREMIER");

  // BLACKLIST
  const [blName, setBlName] = useState("");
  const [blReason, setBlReason] = useState("");

  // HISTORY
  const [historyTitle, setHistoryTitle] = useState("");
  const [historyContent, setHistoryContent] = useState("");

  // LIMITS
  const [limitRank, setLimitRank] = useState("");
  const [limitValue, setLimitValue] = useState("");

  // ================= LOAD =================
  useEffect(() => {
    checkUser();

    loadPeople();
    loadBlacklist();
    loadHistory();
    loadRankLimits();

    supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function loadPeople() {
    const { data } = await supabase
      .from("people")
      .select("*");

    setPeople(data || []);
  }

  async function loadBlacklist() {
    const { data } = await supabase
      .from("blacklist")
      .select("*");

    setBlacklist(data || []);
  }

  async function loadHistory() {
    const { data } = await supabase
      .from("history")
      .select("*");

    setHistory(data || []);
  }

  async function loadRankLimits() {
    const { data } = await supabase
      .from("rank_limits")
      .select("*");

    setRankLimits(data || []);
  }

  // ================= LOGIN =================
  async function login() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  // ================= LIMIT CHECK =================
  function checkLimit(currentSlot: string) {

    const limitData = rankLimits.find(
      (x) => x.rank === currentSlot
    );

    if (!limitData) return false;

    const current = people.filter(
      (p) => p.slot === currentSlot
    ).length;

    return current >= limitData.limit_value;
  }

  // ================= ADD PERSON =================
  async function addPerson() {

    if (!name || !position) {
      alert("Fill required fields");
      return;
    }

    if (checkLimit(slot)) {
      alert("Rank limit reached!");
      return;
    }

    const { error } = await supabase
      .from("people")
      .insert([
        {
          name,
          rank,
          position,
          department,
          slot,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    setRank("");
    setPosition("");
    setDepartment("");

    loadPeople();
  }

  async function removePerson(id: string) {
    await supabase
      .from("people")
      .delete()
      .eq("id", id);

    loadPeople();
  }

  // ================= BLACKLIST =================
  async function addBlacklist() {

    if (!blName || !blReason) return;

    await supabase
      .from("blacklist")
      .insert([
        {
          name: blName,
          reason: blReason,
        },
      ]);

    setBlName("");
    setBlReason("");

    loadBlacklist();
  }

  async function removeBlacklist(id: string) {
    await supabase
      .from("blacklist")
      .delete()
      .eq("id", id);

    loadBlacklist();
  }

  // ================= HISTORY =================
  async function addHistory() {

    if (!historyTitle || !historyContent) return;

    await supabase
      .from("history")
      .insert([
        {
          title: historyTitle,
          content: historyContent,
        },
      ]);

    setHistoryTitle("");
    setHistoryContent("");

    loadHistory();
  }

  async function removeHistory(id: string) {

    await supabase
      .from("history")
      .delete()
      .eq("id", id);

    loadHistory();
  }

  // ================= LIMITS =================
  async function addRankLimit() {

    if (!limitRank || !limitValue) return;

    await supabase
      .from("rank_limits")
      .insert([
        {
          rank: limitRank,
          limit_value: Number(limitValue),
        },
      ]);

    setLimitRank("");
    setLimitValue("");

    loadRankLimits();
  }

  async function removeRankLimit(id: string) {

    await supabase
      .from("rank_limits")
      .delete()
      .eq("id", id);

    loadRankLimits();
  }

  // ================= SECTIONS =================
  const sections = [
    {
      title: "EAST MIDTOWN COMMAND",
      slots: ["OWNER", "OVERSIGHT"],
    },
    {
      title: "OFFICE OF THE PREMIER",
      slots: ["PREMIER", "DEPUTY_PREMIER"],
    },
    {
      title: "HIGH COMMAND",
      slots: [
        "GENERAL_SECRETARY",
        "DEPUTY_GENERAL_SECRETARY",
      ],
    },
    {
      title: "MINISTERS OFFICE",
      slots: ["MINISTER", "DEPUTY_MINISTER"],
    },
    {
      title: "DIVISION REPRESENTATIVES",
      slots: [
        "SPECIAL_FORCES",
        "RED_GUARDS",
        "TANK_DIVISION",
        "CSS",
      ],
    },
  ];

  return (
    <div className="bg-[#050505] text-white min-h-screen flex">

      {/* ================= SIDEBAR ================= */}
      <div className="w-72 bg-[#0d0d0d] border-r border-zinc-800 p-5">

        <div className="flex items-center gap-3 mb-10">

          <div className="bg-white text-black p-3 rounded-2xl">
            <Crown />
          </div>

          <div>
            <h1 className="font-black text-xl">
              EAST MIDTOWN
            </h1>

            <p className="text-zinc-500 text-sm">
              Administration System
            </p>
          </div>

        </div>

        <div className="space-y-3">

          <button
            onClick={() => setActiveTab("command")}
            className={`w-full text-left p-4 rounded-2xl transition ${
              activeTab === "command"
                ? "bg-white text-black"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <Shield className="inline mr-2" size={18} />
            Chain Of Command
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full text-left p-4 rounded-2xl transition ${
              activeTab === "history"
                ? "bg-white text-black"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <BookText className="inline mr-2" size={18} />
            CSS History
          </button>

          <button
            onClick={() => setActiveTab("limits")}
            className={`w-full text-left p-4 rounded-2xl transition ${
              activeTab === "limits"
                ? "bg-white text-black"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <Scale className="inline mr-2" size={18} />
            Rank Limits
          </button>

          <button
            onClick={() => setActiveTab("blacklist")}
            className={`w-full text-left p-4 rounded-2xl transition ${
              activeTab === "blacklist"
                ? "bg-red-600 text-white"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <Ban className="inline mr-2" size={18} />
            Blacklist
          </button>

        </div>

      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1">

        {/* TOPBAR */}
        <div className="border-b border-zinc-800 bg-[#0d0d0d] px-8 py-5 flex justify-between items-center">

          <div className="relative w-96">

            <Search
              className="absolute left-3 top-3 text-zinc-500"
              size={18}
            />

            <input
              placeholder="Search member..."
              className="bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 p-3 w-full outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          {!user ? (
            <button
              onClick={login}
              className="bg-white text-black px-5 py-3 rounded-2xl font-bold"
            >
              LOGIN WITH GOOGLE
            </button>
          ) : (
            <div className="flex items-center gap-4">

              <img
                src={user.user_metadata?.avatar_url}
                className="w-12 h-12 rounded-full border-2 border-white"
              />

              <div>
                <p className="font-bold">
                  {user.user_metadata?.full_name}
                </p>

                <p className="text-zinc-400 text-sm">
                  {user.email}
                </p>
              </div>

              <button
                onClick={logout}
                className="bg-red-600 p-3 rounded-2xl"
              >
                <LogOut size={18} />
              </button>

            </div>
          )}

        </div>

        {/* CONTENT */}
        <div className="p-8">

          {/* ================= COMMAND ================= */}
          {activeTab === "command" && (
            <>

              {isAdmin && (
                <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-6 mb-10">

                  <h2 className="text-3xl font-black mb-6">
                    Add Person
                  </h2>

                  <div className="grid grid-cols-2 gap-4">

                    <input
                      placeholder="Nickname"
                      className="bg-black border border-zinc-700 p-4 rounded-2xl"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                    />

                    <input
                      placeholder="Rank"
                      className="bg-black border border-zinc-700 p-4 rounded-2xl"
                      value={rank}
                      onChange={(e) =>
                        setRank(e.target.value)
                      }
                    />

                    <input
                      placeholder="Position"
                      className="bg-black border border-zinc-700 p-4 rounded-2xl"
                      value={position}
                      onChange={(e) =>
                        setPosition(e.target.value)
                      }
                    />

                    <input
                      placeholder="Department"
                      className="bg-black border border-zinc-700 p-4 rounded-2xl"
                      value={department}
                      onChange={(e) =>
                        setDepartment(e.target.value)
                      }
                    />

                    <select
                      className="bg-black border border-zinc-700 p-4 rounded-2xl col-span-2"
                      value={slot}
                      onChange={(e) =>
                        setSlot(e.target.value)
                      }
                    >
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

                  <button
                    onClick={addPerson}
                    className="mt-5 bg-white text-black px-5 py-4 rounded-2xl font-black"
                  >
                    ADD PERSON
                  </button>

                </div>
              )}

              {sections.map((section) => (
                <div
                  key={section.title}
                  className="bg-[#111111] border border-zinc-800 rounded-3xl p-6 mb-8"
                >

                  <h2 className="text-2xl font-black mb-6">
                    {section.title}
                  </h2>

                  {section.slots.map((slotName) => (

                    <div key={slotName} className="mb-6">

                      <h3 className="text-zinc-500 mb-3 font-bold">
                        {slotName.replaceAll("_", " ")}
                      </h3>

                      {people
                        .filter(
                          (p) =>
                            p.slot === slotName &&
                            p.name
                              .toLowerCase()
                              .includes(
                                search.toLowerCase()
                              )
                        )
                        .map((p) => (

                          <div
                            key={p.id}
                            className="bg-black border border-zinc-800 rounded-2xl p-5 flex justify-between items-center mb-3"
                          >

                            <div>
                              <p className="font-bold text-lg">
                                {p.position}
                              </p>

                              <p className="text-zinc-400">
                                {p.name}
                              </p>
                            </div>

                            {isAdmin && (
                              <button
                                onClick={() =>
                                  removePerson(p.id)
                                }
                                className="bg-red-600 p-3 rounded-xl"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}

                          </div>
                        ))}

                    </div>
                  ))}

                </div>
              ))}

            </>
          )}

          {/* ================= HISTORY ================= */}
          {activeTab === "history" && (

            <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8">

              <div className="flex justify-between items-center mb-8">

                <h1 className="text-3xl font-black">
                  CSS History
                </h1>

              </div>

              {isAdmin && (

                <div className="mb-10">

                  <input
                    placeholder="History Title"
                    className="bg-black border border-zinc-700 p-4 rounded-2xl w-full mb-4"
                    value={historyTitle}
                    onChange={(e) =>
                      setHistoryTitle(e.target.value)
                    }
                  />

                  <textarea
                    placeholder="History Content"
                    className="bg-black border border-zinc-700 p-4 rounded-2xl w-full h-40 mb-4"
                    value={historyContent}
                    onChange={(e) =>
                      setHistoryContent(e.target.value)
                    }
                  />

                  <button
                    onClick={addHistory}
                    className="bg-white text-black px-5 py-4 rounded-2xl font-black"
                  >
                    ADD HISTORY
                  </button>

                </div>
              )}

              <div className="space-y-5">

                {history.map((item) => (

                  <div
                    key={item.id}
                    className="bg-black border border-zinc-800 rounded-2xl p-6"
                  >

                    <div className="flex justify-between">

                      <div>

                        <h2 className="text-2xl font-black mb-3">
                          {item.title}
                        </h2>

                        <p className="text-zinc-400 leading-8">
                          {item.content}
                        </p>

                      </div>

                      {isAdmin && (
                        <button
                          onClick={() =>
                            removeHistory(item.id)
                          }
                          className="bg-red-600 p-3 rounded-xl h-fit"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}

                    </div>

                  </div>
                ))}

              </div>

            </div>
          )}

          {/* ================= LIMITS ================= */}
          {activeTab === "limits" && (

            <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8">

              <h1 className="text-3xl font-black mb-8">
                Rank Limits
              </h1>

              {isAdmin && (

                <div className="grid grid-cols-2 gap-4 mb-10">

                  <input
                    placeholder="Rank Name"
                    className="bg-black border border-zinc-700 p-4 rounded-2xl"
                    value={limitRank}
                    onChange={(e) =>
                      setLimitRank(e.target.value)
                    }
                  />

                  <input
                    placeholder="Limit"
                    type="number"
                    className="bg-black border border-zinc-700 p-4 rounded-2xl"
                    value={limitValue}
                    onChange={(e) =>
                      setLimitValue(e.target.value)
                    }
                  />

                  <button
                    onClick={addRankLimit}
                    className="bg-white text-black px-5 py-4 rounded-2xl font-black col-span-2"
                  >
                    ADD LIMIT
                  </button>

                </div>
              )}

              <div className="space-y-4">

                {rankLimits.map((limit) => (

                  <div
                    key={limit.id}
                    className="bg-black border border-zinc-800 rounded-2xl p-5 flex justify-between items-center"
                  >

                    <div>
                      <p className="font-black text-xl">
                        {limit.rank}
                      </p>

                      <p className="text-zinc-400">
                        LIMIT: {limit.limit_value}
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() =>
                          removeRankLimit(limit.id)
                        }
                        className="bg-red-600 p-3 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                  </div>
                ))}

              </div>

            </div>
          )}

          {/* ================= BLACKLIST ================= */}
          {activeTab === "blacklist" && (

            <div className="bg-[#140909] border border-red-900 rounded-3xl p-8">

              <div className="flex items-center gap-4 mb-8">

                <div className="bg-red-600 p-4 rounded-2xl">
                  <Ban />
                </div>

                <div>

                  <h1 className="text-4xl font-black">
                    BLACKLIST DATABASE
                  </h1>

                  <p className="text-red-300">
                    Restricted & banned members
                  </p>

                </div>

              </div>

              {isAdmin && (

                <div className="grid grid-cols-2 gap-4 mb-10">

                  <input
                    placeholder="Nickname"
                    className="bg-black border border-red-800 p-4 rounded-2xl"
                    value={blName}
                    onChange={(e) =>
                      setBlName(e.target.value)
                    }
                  />

                  <input
                    placeholder="Reason"
                    className="bg-black border border-red-800 p-4 rounded-2xl"
                    value={blReason}
                    onChange={(e) =>
                      setBlReason(e.target.value)
                    }
                  />

                  <button
                    onClick={addBlacklist}
                    className="bg-red-600 px-5 py-4 rounded-2xl font-black col-span-2"
                  >
                    ADD TO BLACKLIST
                  </button>

                </div>
              )}

              <div className="space-y-4">

                {blacklist.map((b) => (

                  <div
                    key={b.id}
                    className="bg-black border border-red-900 rounded-2xl p-5 flex justify-between items-center"
                  >

                    <div>

                      <p className="font-black text-xl text-red-400">
                        {b.name}
                      </p>

                      <p className="text-zinc-400">
                        {b.reason}
                      </p>

                    </div>

                    {isAdmin && (

                      <button
                        onClick={() =>
                          removeBlacklist(b.id)
                        }
                        className="bg-red-600 p-3 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>

                    )}

                  </div>
                ))}

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}