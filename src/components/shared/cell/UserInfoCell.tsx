interface Props { firstName: string; lastName: string; email?: string; role?: string; avatarUrl?: string; }
export default function UserInfoCell({ firstName, lastName, email, role, avatarUrl }: Props) {
  const initials = `${firstName[0]}${lastName[0]}`;
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#C8102E]/15 border border-[#C8102E]/20 flex items-center justify-center text-xs font-display font-semibold text-white flex-shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-white text-sm font-sans font-medium truncate">{firstName} {lastName}</p>
        {email && <p className="text-white/40 text-xs font-sans truncate">{email}</p>}
        {role && <p className="text-white/30 text-[9px] font-sans uppercase tracking-wider">{role}</p>}
      </div>
    </div>
  );
}
