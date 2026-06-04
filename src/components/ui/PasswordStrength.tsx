// components/ui/PasswordStrength.tsx
"use client";

interface Props {
  password: string;
}

type StrengthLevel = "Muy débil" | "Débil" | "Regular" | "Fuerte" | "Muy fuerte";

function getStrength(password: string): { score: number; label: StrengthLevel } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels: StrengthLevel[] = ["Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"];
  const index = Math.min(Math.floor(score / 1.3), 4);
  return { score, label: labels[index] };
}

const COLORS = [
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-[#1A9FB4]",
  "bg-[#10B981]",
];

export function PasswordStrength({ password }: Props) {
  if (!password) return null;
  const { score, label } = getStrength(password);
  const index = Math.min(Math.floor(score / 1.3), 4);

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= index ? COLORS[index] : "bg-[#E2E8F0]"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-[#94A3B8]">
        Seguridad:{" "}
        <span
          className="font-medium"
          style={{
            color: index >= 3 ? "#10B981" : index === 2 ? "#F59E0B" : "#ef4444",
          }}
        >
          {label}
        </span>
      </p>
    </div>
  );
}
