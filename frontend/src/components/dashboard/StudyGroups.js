import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  UserGroupIcon,
  LockClosedIcon,
  GlobeAltIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const API_BASE = "http://localhost:8080/api/groups";
const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

// Predefined course list (code / coursename)
const COURSE_LIST = [
  { code: "CS101", coursename: "Computer Science 101" },
  { code: "MATH101", coursename: "Calculus I" },
  { code: "PHY101", coursename: "Physics I" },
  { code: "ENG101", coursename: "English Literature" },
  { code: "HIST101", coursename: "World History" },
  { code: "CS102", coursename: "Data Structures" },
  { code: "CS103", coursename: "Algorithms" },
  { code: "CS104", coursename: "Operating Systems" },
  { code: "CS105", coursename: "Database Management Systems" },
  { code: "CS106", coursename: "Computer Networks" },
  { code: "ECE101", coursename: "Digital Electronics" },
  { code: "ECE102", coursename: "Analog Electronics" },
  { code: "ECE103", coursename: "Signal & Systems" },
  { code: "ECE104", coursename: "Microprocessors" },
  { code: "ECE105", coursename: "Communication Systems" },
  {code: "OTHER", coursename: "Other Course"},
];

export default function StudyGroups() {
  const [myGroups, setMyGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(
    JSON.parse(localStorage.getItem("pendingGroups")) || []
  );
  const [joinRequests, setJoinRequests] = useState({}); // groupId -> requests array
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrivacy, setFilterPrivacy] = useState("ALL"); // ALL, PUBLIC, PRIVATE, MEMBER
  const [filterCourse, setFilterCourse] = useState(""); // coursename
  const [minMembers, setMinMembers] = useState("");
  const [maxMembers, setMaxMembers] = useState("");

  useEffect(() => {
    loadAllGroups();
    // sync pendingRequests from local storage in case other tabs changed it
    const lsPending = JSON.parse(localStorage.getItem("pendingGroups")) || [];
    setPendingRequests(lsPending);
  }, []);

  // Normalize a group object to ensure memberCount & coursename existence
  const normalizeGroup = (g) => {
    return {
      ...g,
      memberCount: Number(g.memberCount ?? 0),
      coursename: g.coursename ?? "",
      // Try to map courseId to coursename if coursename missing and courseId matches a known code suffix
      ...(g.coursename ? {} : (() => {
        const found = COURSE_LIST.find(c => c.code === (g.courseId && g.courseId.toString().startsWith("CS") ? g.courseId : g.courseId));
        return found ? { coursename: found.coursename } : {};
      })()),
    };
  };

  // Load created / joined / available lists
  const loadAllGroups = async () => {
    setLoading(true);
    try {
      const [createdRes, joinedRes, availableRes] = await Promise.all([
        fetch(`${API_BASE}/created/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/joined/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/available/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!createdRes.ok || !joinedRes.ok || !availableRes.ok) {
        console.error("One or more group endpoints returned non-OK");
      }

      const [createdJson, joinedJson, availableJson] = await Promise.all([
        createdRes.json(),
        joinedRes.json(),
        availableRes.json(),
      ]);

      setMyGroups(Array.isArray(createdJson) ? createdJson.map(normalizeGroup) : []);
      setJoinedGroups(Array.isArray(joinedJson) ? joinedJson.map(normalizeGroup) : []);
      setAvailableGroups(Array.isArray(availableJson) ? availableJson.map(normalizeGroup) : []);
      // refresh pending from localStorage
      setPendingRequests(JSON.parse(localStorage.getItem("pendingGroups")) || []);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create Group
  const createGroup = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        userId,
        name: formData.name,
        description: formData.description,
        courseId: formData.courseId || formData.code || "", // backend expects courseId string
        privacy: formData.privacy,
        code: formData.code || "",
        coursename: formData.coursename || "",
      };

      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to create group");
      }

      await loadAllGroups();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Create group failed:", err);
      alert("Failed to create group: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Join group (public -> immediate join; private -> request)
  const joinGroup = async (group) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/join/${group.id}?userId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();

      if (text.toLowerCase().includes("request")) {
        // It's a pending request
        const updatedPending = [...pendingRequests.filter(p => p.id !== group.id), normalizeGroup(group)];
        setPendingRequests(updatedPending);
        localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
        alert("Request sent. Waiting for admin approval.");
      } else {
        // Immediately joined
        await loadAllGroups();
        alert("Joined group.");
      }
    } catch (err) {
      console.error("Join group error:", err);
      alert("Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  // Leave group
  const leaveGroup = async (groupId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/leave/${groupId}/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to leave group");
      // remove from joinedGroups
      setJoinedGroups(prev => prev.filter(g => g.id !== groupId));
      await loadAllGroups();
    } catch (err) {
      console.error("Leave group error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending join requests for admin
  const fetchJoinRequests = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE}/${groupId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch join requests");
      const data = await res.json();
      setJoinRequests(prev => ({ ...prev, [groupId]: data || [] }));
    } catch (err) {
      console.error("Error fetching join requests:", err);
    }
  };

  // Approve a join request (memberId)
  const approveRequest = async (memberId, groupId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/approve/${memberId}?adminId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "approve failed");
      }

      // Refresh admin requests and lists
      await fetchJoinRequests(groupId);
      await loadAllGroups();

      // Remove the group from pendingRequests (for the request-sender user)
      const updatedPending = (JSON.parse(localStorage.getItem("pendingGroups")) || []).filter(g => g.id !== groupId);
      localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
      setPendingRequests(updatedPending);

      alert("Request approved.");
    } catch (err) {
      console.error("Approve error:", err);
      alert("Approve failed");
    } finally {
      setLoading(false);
    }
  };

  // Reject a join request
  const rejectRequest = async (memberId, groupId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reject/${memberId}?adminId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "reject failed");
      }

      // Refresh admin requests
      await fetchJoinRequests(groupId);

      // Remove group from pendingRequests
      const updatedPending = (JSON.parse(localStorage.getItem("pendingGroups")) || []).filter(g => g.id !== groupId);
      localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
      setPendingRequests(updatedPending);

      alert("Request rejected.");
    } catch (err) {
      console.error("Reject error:", err);
      alert("Reject failed");
    } finally {
      setLoading(false);
    }
  };

  // RequestCard component (admin view)
  const RequestCard = ({ req, groupId }) => {
    const formattedDate = req.requestedAt ? new Date(req.requestedAt).toLocaleString() : "";
    return (
      <div className="border rounded p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
        <div>
          <p className="font-medium text-gray-900">{req.userName}</p>
          <p className="text-sm text-gray-600">{req.userMajor}</p>
          <p className="text-xs text-gray-500 mt-1">Requested: {formattedDate}</p>
        </div>
        <div className="flex space-x-2">
          <button
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => approveRequest(req.memberId, groupId)}
            title="Approve"
          >
            <CheckIcon className="h-4 w-4" />
          </button>
          <button
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => rejectRequest(req.memberId, groupId)}
            title="Reject"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // GroupCard component (all roles)
  const GroupCard = ({ group, role }) => (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md bg-white flex flex-col h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            {group.privacy === "PRIVATE" ? (
              <LockClosedIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <GlobeAltIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{group.description}</p>
        </div>
        {role === "admin" && (
          <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700" title="Delete (not implemented)" />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="h-5 w-5 text-gray-400" />
          {console.log(group)}
          <span>{group.memberCount} members</span>
        </div>
        <div className="text-xs text-gray-500">{group.coursename || group.courseId}</div>
      </div>

      {/* Admin private group's requests */}
      {role === "admin" && group.privacy === "PRIVATE" && (
        <>
          <button
            className="btn-secondary w-full mt-4"
            onClick={() => fetchJoinRequests(group.id)}
          >
            View Join Requests
          </button>

          {joinRequests[group.id] && joinRequests[group.id].length > 0 ? (
            <div className="mt-3 space-y-2 border-t pt-3">
              {joinRequests[group.id].map(req => <RequestCard key={req.memberId} req={req} groupId={group.id} />)}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-2">No pending requests.</p>
          )}
        </>
      )}

      {/* Actions for joined group */}
      {role === "joined" && (
        <div className="mt-auto pt-4 flex gap-2">
          <button className="btn-primary flex-1 flex items-center justify-center gap-2">
            <ChatBubbleLeftRightIcon className="h-4 w-4" /> Open Chat
          </button>
          <button onClick={() => leaveGroup(group.id)} className="btn-secondary flex-1 text-red-600">
            Leave Group
          </button>
        </div>
      )}

      {/* Actions for admin (manage/chat) */}
      {role === "admin" && (
        <div className="mt-4 flex gap-2">
          <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Cog6ToothIcon className="h-4 w-4" /> Manage
          </button>
          <button className="btn-primary flex-1 flex items-center justify-center gap-2">
            <ChatBubbleLeftRightIcon className="h-4 w-4" /> Open Chat
          </button>
        </div>
      )}

      {role === "available" && (
        <button onClick={() => joinGroup(group)} disabled={loading} className="btn-primary w-full mt-4">
          Join Group
        </button>
      )}

      {role === "pending" && (
        <div className="mt-4">
          <span className="text-sm text-yellow-700">Request Sent • Waiting approval</span>
        </div>
      )}
    </div>
  );

  // CreateGroupModal
  const CreateGroupModal = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
      name: "",
      code: "",
      coursename: "",
      courseId: "",
      description: "",
      privacy: "PUBLIC",
    });

    const handleCourseChange = (code) => {
      const found = COURSE_LIST.find(c => c.code === code);
      if (found) {
        setFormData(fd => ({
          ...fd,
          code: found.code,
          coursename: found.coursename,
          courseId: found.code.replace(/\D/g, ""),
        }));
      } else {
        setFormData(fd => ({ ...fd, code: "", coursename: "", courseId: "" }));
      }
    };

    const submit = async (e) => {
      e.preventDefault();
      await createGroup(formData);
    };

    if (!open) return null;
   return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 transition-transform transform scale-100">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-800">✨ Create New Study Group</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          title="Close"
        >
          ✕
        </button>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <input
            required
            className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition"
            placeholder="Enter your group name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Course Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
          <select
            required
            className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition bg-white"
            value={formData.code}
            onChange={e => handleCourseChange(e.target.value)}
          >
            <option value="">Choose a course</option>
            {COURSE_LIST.map(c => (
              <option key={c.code} value={c.code}>
                {c.coursename} ({c.code})
              </option>
            ))}
          </select>

          {formData.code && (
            <div className="mt-2 bg-gray-50 rounded-lg p-2 text-sm border border-gray-200">
              <p><strong>📘 Course:</strong> {formData.coursename}</p>
              <p><strong>🆔 Code:</strong> {formData.code}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition min-h-[90px] resize-y"
            placeholder="Describe your group purpose..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
          <select
            className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition bg-white"
            value={formData.privacy}
            onChange={e => setFormData({ ...formData, privacy: e.target.value })}
          >
            <option value="PUBLIC">🌍 Public - Anyone can join</option>
            <option value="PRIVATE">🔒 Private - Requires admin approval</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

  };

  // Filters applied to availableGroups
  const filteredAvailableGroups = availableGroups
    .map(normalizeGroup)
    .filter(g => {
      const matchesSearch = !searchTerm || (g.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrivacy = filterPrivacy === "ALL" || g.privacy === filterPrivacy;
      const matchesCourse = !filterCourse || (g.coursename || "").toLowerCase() === filterCourse.toLowerCase();
      const members = Number(g.memberCount ?? 0);
      const minOk = !minMembers || members >= Number(minMembers);
      const maxOk = !maxMembers || members <= Number(maxMembers);
      return matchesSearch && matchesPrivacy && matchesCourse && minOk && maxOk;
    });

  // Helpers for UI dropdowns
  const coursesDropdown = COURSE_LIST.map(c => ({ label: c.coursename, value: c.coursename }));

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <p className="text-sm text-gray-500">Create, find and join study groups for your courses.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="h-4 w-4" /> Create Group
          </button>
        </div>
      </div>

      {/* My Own Groups */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">My Own Groups ({myGroups.length})</h3>
        </div>
        {myGroups.length === 0 ? (
          <p className="text-gray-500">You haven't created any groups yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGroups.map(g => <GroupCard key={g.id} group={normalizeGroup(g)} role="admin" />)}
          </div>
        )}
      </section>

      {/* Groups I Joined */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Groups I Joined ({joinedGroups.length})</h3>
        </div>
        {joinedGroups.length === 0 ? (
          <p className="text-gray-500">You haven't joined any groups yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedGroups.map(g => <GroupCard key={g.id} group={normalizeGroup(g)} role="joined" />)}
          </div>
        )}
      </section>

      {/* Available Groups — Filters */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Available Groups ({availableGroups.length})</h3>
        </div>

        <div className="bg-white border rounded p-3 mb-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input className="pl-10 input-field w-full" placeholder="Search groups..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <select className="input-field w-48" value={filterPrivacy} onChange={e => setFilterPrivacy(e.target.value)}>
            <option value="ALL">All privacy</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="MEMBER">Member</option>
          </select>

          <select className="input-field w-56" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="">All courses</option>
            {coursesDropdown.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <input className="input-field w-28" placeholder="Min" type="number" min="0" value={minMembers} onChange={e => setMinMembers(e.target.value)} />
          <input className="input-field w-28" placeholder="Max" type="number" min="0" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} />
        </div>

        {filteredAvailableGroups.length === 0 ? (
          <p className="text-gray-500">No available groups found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAvailableGroups.map(g => <GroupCard key={g.id} group={normalizeGroup(g)} role="available" />)}
          </div>
        )}
      </section>

      {/* Pending Requests Sent */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Pending Requests Sent ({pendingRequests.length})</h3>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(g => <GroupCard key={g.id} group={normalizeGroup(g)} role="pending" />)}
          </div>
        )}
      </section>

      <CreateGroupModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
