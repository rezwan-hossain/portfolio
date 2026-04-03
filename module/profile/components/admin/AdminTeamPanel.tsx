// module/profile/components/admin/AdminTeamPanel.tsx
"use client";

import { useState } from "react";
import {
  updateTeamMember,
  deleteTeamMember,
  getAllTeamMembers,
  toggleTeamMemberActive,
} from "@/app/actions/team";

import type { TeamMember } from "@/types/team";
import {
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Users,
  UserCog,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import Image from "next/image";
import { TeamMemberForm } from "./TeamMemberForm";

type Props = {
  initialMembers: TeamMember[];
};

type View = "list" | "create" | "edit";

export function AdminTeamPanel({ initialMembers }: Props) {
  const [view, setView] = useState<View>("list");
  const [members, setMembers] = useState(initialMembers);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const adminMembers = members.filter((m) => m.category === "ADMIN");
  const teamMembers = members.filter((m) => m.category === "ADVISOR");
  const activeCount = members.filter((m) => m.isActive).length;

  const refreshMembers = async () => {
    const { members: updated } = await getAllTeamMembers();
    setMembers(updated as TeamMember[]);
    return updated as TeamMember[];
  };

  const handleCreate = () => {
    setEditingMember(null);
    setView("create");
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setEditingMember(null);
  };

  const handleSuccess = (updatedMembers: TeamMember[]) => {
    setMembers(updatedMembers);
    setView("list");
    setEditingMember(null);
  };

  const handleToggleActive = async (member: TeamMember) => {
    setLoadingId(member.id);
    await toggleTeamMemberActive(member.id);
    await refreshMembers();
    setLoadingId(null);
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm("Delete this team member?")) return;
    setLoadingId(memberId);
    const result = await deleteTeamMember(memberId);
    if (result.success) {
      await refreshMembers();
    }
    setLoadingId(null);
  };

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div
      className={`bg-white border rounded-xl p-4 transition-all ${
        member.isActive ? "border-gray-200" : "border-gray-200 opacity-50"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle (for future reordering) */}
        <div className="flex-shrink-0 pt-1 cursor-grab text-gray-300 hover:text-gray-400">
          <GripVertical size={16} />
        </div>

        {/* Image */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Users size={24} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-gray-900 truncate">
                {member.name}
              </h4>
              {member.role && (
                <p className="text-sm text-gray-500">{member.role}</p>
              )}
            </div>

            {/* Category Badge */}
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full flex-shrink-0 ${
                member.category === "ADMIN"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {member.category}
            </span>
          </div>

          {member.bio && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {member.bio}
            </p>
          )}

          {/* Social Links Pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {member.linkedinUrl && (
              <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full">
                LinkedIn
              </span>
            )}
            {member.twitterUrl && (
              <span className="px-2 py-0.5 text-[10px] bg-sky-50 text-sky-600 rounded-full">
                Twitter
              </span>
            )}
            {member.githubUrl && (
              <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full">
                GitHub
              </span>
            )}
            {member.instagramUrl && (
              <span className="px-2 py-0.5 text-[10px] bg-pink-50 text-pink-600 rounded-full">
                Instagram
              </span>
            )}
            {member.facebookUrl && (
              <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-600 rounded-full">
                Facebook
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {loadingId === member.id ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleToggleActive(member)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  member.isActive
                    ? "text-green-500 hover:text-red-600 hover:bg-red-50"
                    : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                }`}
                title={member.isActive ? "Hide" : "Show"}
              >
                {member.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                type="button"
                onClick={() => handleEdit(member)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(member.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {view === "list" ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Team</h2>
              <p className="text-sm text-gray-500 mt-1">
                {members.length} member{members.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gray-900 text-white font-bold uppercase tracking-wider text-xs rounded-lg px-5 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Add Member
            </button>
          </>
        ) : (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Team
          </button>
        )}
      </div>

      {/* Content */}
      {view === "list" && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total", value: members.length, icon: Users },
              {
                label: "Admin Team",
                value: adminMembers.length,
                icon: UserCog,
              },
              { label: "Team Members", value: teamMembers.length, icon: Users },
              { label: "Active", value: activeCount, icon: Eye },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} className="text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {members.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No team members yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Add your first team member
              </p>
            </div>
          ) : (
            <>
              {/* Admin Team Section */}
              {adminMembers.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Admin Team ({adminMembers.length})
                  </h3>
                  <div className="space-y-3">
                    {adminMembers.map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members Section */}
              {teamMembers.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    The Crew ({teamMembers.length})
                  </h3>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {(view === "create" || view === "edit") && (
        <TeamMemberForm
          member={editingMember}
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}
