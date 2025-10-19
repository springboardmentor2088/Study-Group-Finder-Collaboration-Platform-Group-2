
// // new code 


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  { code: "OTHER", coursename: "Other Course" },
];

export default function StudyGroups() {
  const [myGroups, setMyGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(
    JSON.parse(localStorage.getItem("pendingGroups")) || []
  );
  const [joinRequests, setJoinRequests] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrivacy, setFilterPrivacy] = useState("ALL");
  const [filterCourse, setFilterCourse] = useState("");
  const [minMembers, setMinMembers] = useState("");
  const [maxMembers, setMaxMembers] = useState("");


// Add this state at the top of StudyGroups component
const [manageOpenGroups, setManageOpenGroups] = useState({});

// Toggle function
const toggleManage = (groupId) => {
  setManageOpenGroups(prev => ({
    ...prev,
    [groupId]: !prev[groupId], // toggle for this group
  }));
};

// Functions in StudyGroups component
const handleMuteGroup = (groupId) => {
  alert(`Group ${groupId} muted (placeholder functionality)`);
  // TODO: Add actual API call to mute notifications
};

const handleDeleteGroup = (groupId) => {
  // if (window.confirm("Are you sure you want to delete this group?")) {
    deleteGroup(groupId); // Use your existing deleteGroup function
  // }
};


  useEffect(() => {
    loadAllGroups();
    setPendingRequests(JSON.parse(localStorage.getItem("pendingGroups")) || []);
  }, []);

  const normalizeGroup = (g) => ({
    ...g,
    memberCount: Number(g.memberCount ?? 0),
    coursename: g.coursename ?? "",
  });

  const navigate = useNavigate();

  const loadAllGroups = async () => {
    setLoading(true);
    try {
      const [createdRes, joinedRes, availableRes] = await Promise.all([
        fetch(`${API_BASE}/created/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/joined/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/available/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [createdJson, joinedJson, availableJson] = await Promise.all([
        createdRes.json(),
        joinedRes.json(),
        availableRes.json(),
      ]);

      setMyGroups(Array.isArray(createdJson) ? createdJson.map(normalizeGroup) : []);
      setJoinedGroups(Array.isArray(joinedJson) ? joinedJson.map(normalizeGroup) : []);
      setAvailableGroups(Array.isArray(availableJson) ? availableJson.map(normalizeGroup) : []);
      setPendingRequests(JSON.parse(localStorage.getItem("pendingGroups")) || []);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        userId,
        name: formData.name,
        description: formData.description,
        courseId: formData.courseId || "",
        privacy: formData.privacy,
        code: formData.code || "",
        coursename: formData.coursename || "",
      };

      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to create group");

      await loadAllGroups();
      setShowCreateModal(false);
    } catch (err) {
      
      // toast.success("Failed to create group: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (group) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/join/${group.id}?userId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();

      if (text.toLowerCase().includes("request")) {
        const updatedPending = [...pendingRequests.filter(p => p.id !== group.id), normalizeGroup(group)];
        setPendingRequests(updatedPending);
        localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
        // alert();
        // toast.success("Request sent. Waiting for admin approval.");
      } else {
        await loadAllGroups();
        // alert("Joined group.");
      }
    } catch (err) {
      // alert("Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (groupId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/leave/${groupId}/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to leave group");
      setJoinedGroups(prev => prev.filter(g => g.id !== groupId));
      await loadAllGroups();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId) => {
    // if (!window.confirm("Are you sure you want to delete this group?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/delete/${groupId}/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text() || "Delete failed");
      // alert("Group deleted successfully.");
      await loadAllGroups();
    } catch (err) {
      // alert("Failed to delete group: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE}/${groupId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch join requests");
      const data = await res.json();
      setJoinRequests(prev => ({ ...prev, [groupId]: data || [] }));
    } catch (err) {
      console.error(err);
    }
  };

  const approveRequest = async (memberId, groupId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/approve/${memberId}?adminId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text() || "Approve failed");
      await fetchJoinRequests(groupId);
      await loadAllGroups();
      const updatedPending = (JSON.parse(localStorage.getItem("pendingGroups")) || []).filter(g => g.id !== groupId);
      localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
      setPendingRequests(updatedPending);
      // alert("Request approved.");
    } catch (err) {
      // alert("Approve failed");
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (memberId, groupId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reject/${memberId}?adminId=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text() || "Reject failed");
      await fetchJoinRequests(groupId);
      const updatedPending = (JSON.parse(localStorage.getItem("pendingGroups")) || []).filter(g => g.id !== groupId);
      localStorage.setItem("pendingGroups", JSON.stringify(updatedPending));
      setPendingRequests(updatedPending);
      // alert("Request rejected.");
      // toast.success("Request rejected.");
    } catch (err) {
      // alert("Reject failed");
    } finally {
      setLoading(false);
    }
  };

  const RequestCard = ({ req, groupId }) => (
    <div className="border rounded-lg p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
      <div>
        <p className="font-medium text-gray-900">{req.userName}</p>
        <p className="text-sm text-gray-600">{req.userMajor}</p>
        <p className="text-xs text-gray-500 mt-1">Requested: {new Date(req.requestedAt).toLocaleString()}</p>
      </div>
      <div className="flex gap-2">
        <button
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => approveRequest(req.memberId, groupId)}
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => rejectRequest(req.memberId, groupId)}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const GroupCard = ({ group, role }) => (
    <div className="border rounded-xl p-5 hover:shadow-lg transition bg-white flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            {group.privacy === "PRIVATE" ? (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
    Private
  </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
    Public
  </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{group.description}</p>
        </div>
        {/* {role === "admin" && (
          <TrashIcon
            className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700"
            title="Delete Group"
            onClick={() => deleteGroup(group.id)}
          />
        )} */}
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-gray-400" />
          <span>{group.memberCount} members</span>
        </div>
        <div className="text-xs text-gray-500">{group.coursename || group.courseId}</div>
      </div>

      {/* Admin private group's requests */}
      {role === "admin" && group.privacy === "PRIVATE" && (
        <>
          <button
            className="mt-4 w-full py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100 transition"
            onClick={() => fetchJoinRequests(group.id)}
          >
            View Join Requests
          </button>

          {joinRequests[group.id] && joinRequests[group.id].length > 0 ? (
            <div className="mt-3 space-y-2">
              {joinRequests[group.id].map(req => (
                <RequestCard key={req.memberId} req={req} groupId={group.id} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-2">No pending requests.</p>
          )}
        </>
      )}

      {/* Joined Group Actions */}
      {role === "joined" && (
        <div className="mt-4 flex gap-2">
          <button
  className="flex-1 py-2 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition"
  onClick={() =>
    navigate(`/group-chat/${group.id}`, {
      state: {
        groupName: group.name,
        groupId: group.id,
        privacy: group.privacy,
        coursename: group.coursename,
        memberCount: group.memberCount,
      },
    })
  }
>
  <ChatBubbleLeftRightIcon className="h-4 w-4" /> Open Chat
</button>
          <button
            className="flex-1 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-50 transition"
            onClick={() => leaveGroup(group.id)}
          >
            Leave Group
          </button>
        </div>
      )}

      {/* Admin Actions */}
{role === "admin" && (
  <div className="mt-4 flex flex-col gap-2">
    {/* Manage Button */}
    <button
      className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
      onClick={() => toggleManage(group.id)}
    >
      <Cog6ToothIcon className="h-4 w-4" /> Manage
    </button>

    {/* Dropdown with Mute and Delete */}
    {manageOpenGroups[group.id] && (
      <div className="flex gap-2 mt-2">
        <button
          className="flex-1 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
          onClick={() => handleMuteGroup(group.id)}
        >
          Mute
        </button>
        <button
          className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          onClick={() => handleDeleteGroup(group.id)}
        >
          Delete
        </button>
      </div>
    )}

    {/* Open Chat Button */}
    <button
      className="flex-1 py-2 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition mt-2"
      onClick={() =>
        navigate(`/group-chat/${group.id}`, {
          state: {
            groupName: group.name,
            groupId: group.id,
            privacy: group.privacy,
            coursename: group.coursename,
            memberCount: group.memberCount,
          },
        })
      }
    >
      <ChatBubbleLeftRightIcon className="h-4 w-4" /> Open Chat
    </button>
  </div>
)}





      {role === "available" && (
        <button
          className="mt-4 w-full py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          onClick={() => joinGroup(group)}
          disabled={loading}
        >
          Join Group
        </button>
      )}

      {role === "pending" && (
        <span className="mt-4 inline-block text-yellow-700 text-sm font-medium">
          Request Sent • Waiting Approval
        </span>
      )}
    </div>
  );

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
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-800">Create New Study Group</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold">✕</button>
          </div>

          <form onSubmit={submit} className="space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              <select
                required
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition bg-white"
                value={formData.code}
                onChange={e => handleCourseChange(e.target.value)}
              >
                <option value="">Choose a course</option>
                {COURSE_LIST.map(c => <option key={c.code} value={c.code}>{c.coursename} ({c.code})</option>)}
              </select>
              {formData.code && (
                <div className="mt-2 bg-gray-50 rounded-lg p-2 text-sm border border-gray-200">
                  <p><strong>Course:</strong> {formData.coursename}</p>
                  <p><strong>Code:</strong> {formData.code}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 p-2.5 outline-none transition min-h-[90px] resize-y"
                placeholder="Describe your group purpose..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

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

  const filteredAvailableGroups = availableGroups
    .map(normalizeGroup)
    .filter(g => {
      const size=Number(maxMembers);
      const matchesSearch = !searchTerm || (g.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrivacy = filterPrivacy === "ALL" || g.privacy === filterPrivacy;
      const matchesCourse = !filterCourse || (g.coursename || "").toLowerCase() === filterCourse.toLowerCase();
      const members = Number(g.memberCount ?? 0);
       if (members === 0) return false;
      const matchesSize = !maxMembers || members === size;
      return matchesSearch && matchesPrivacy && matchesCourse && matchesSize;
    });

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <p className="text-sm text-gray-500">Create, find and join study groups for your courses.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <PlusIcon className="h-4 w-4" /> Create Group
        </button>
      </div>

      {/* My Groups */}
      <section>
  <h3 className="text-xl font-semibold mb-4">
    My Own Groups ({myGroups.length})
  </h3>

  {myGroups.length === 0 ? (
    <p className="text-gray-500">You haven't created any groups yet.</p>
  ) : (
    <div className="flex flex-wrap gap-4">
      {myGroups.map(g => (
        <div key={g.id} className="flex-shrink-0 w-full sm:w-[48%] md:w-[32%]">
          <GroupCard group={normalizeGroup(g)} role="admin" />
        </div>
      ))}
    </div>
  )}
</section>


      {/* Joined Groups */}
      <section>
  {/* <h3 className="text-xl font-semibold mb-4">
    Groups I Joined ({joinedGroups.length})
  </h3> */}

  {joinedGroups.length === 0 ? (
    <p className="text-gray-500">You haven't joined any groups yet.</p>
  ) : (
    <div className="flex flex-wrap gap-4">
      {joinedGroups.map(g => (
        <div key={g.id} className="flex-shrink-0 w-full sm:w-[48%] md:w-[32%]">
          <GroupCard group={normalizeGroup(g)} role="joined" />
        </div>
      ))}
    </div>
  )}
</section>


      {/* Available Groups */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Available Groups ({availableGroups.length})</h3>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            className="input-field flex-9 p-2 border rounded-lg"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select className="input-field flex-4 p-2 border rounded-lg" value={filterPrivacy} onChange={e => setFilterPrivacy(e.target.value)}>
            <option value="ALL">All privacy</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
          <select className="input-field  p-2 border rounded-lg" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="">All courses</option>
            {COURSE_LIST.map(c => <option key={c.code} value={c.coursename}>{c.coursename}</option>)}
          </select>

          <input
      className="input-field p-2 border rounded-lg w-28"
      type="number"
      placeholder="Group size"
      value={maxMembers}
      onChange={e => setMaxMembers(e.target.value)}
    />
        </div>
        {filteredAvailableGroups.length === 0 ? (
    <p className="text-gray-500">No available groups found.</p>
  ) : (
    <div className="flex flex-wrap gap-4">
  {filteredAvailableGroups.map(g => (
    <div key={g.id} className="flex-shrink-0 w-full sm:w-[48%] md:w-[32%]">
      <GroupCard group={normalizeGroup(g)} role="available" />
    </div>
  ))}
</div>


  )}
      </section>

      {/* Pending Requests */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Pending Requests Sent ({pendingRequests.length})</h3>
        {pendingRequests.length === 0 ? <p className="text-gray-500">No pending requests.</p> :
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(g => <GroupCard key={g.id} group={normalizeGroup(g)} role="pending" />)}
          </div>
        }
      </section>

      <CreateGroupModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}