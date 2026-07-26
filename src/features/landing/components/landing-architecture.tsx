export function LandingArchitecture() {
  return (
    <section
      id="architecture"
      className="max-w-7xl mx-auto px-6 py-24 border-t border-[var(--glass-border)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Solid Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Strict Layered Architecture
          </h2>
          <p className="text-muted-foreground leading-relaxed font-light">
            Our application enforces a deterministic architecture sequence.
            Queries and database mutations are restricted to the DAL, invoked
            via business services called strictly from server actions.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            {[
              {
                num: "1",
                label: "Action Layer",
                desc: "Validates payload inputs and user session context.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
              },
              {
                num: "2",
                label: "Service Layer",
                desc: "Executes business logic validations and coordination.",
                color: "text-accent",
                bg: "bg-accent/10 border-accent/20",
              },
              {
                num: "3",
                label: "DAL (Data Access Layer)",
                desc: "Performs isolated queries within database transactions.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
              },
            ].map(({ num, label, desc, color, bg }) => (
              <div key={num} className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-lg ${bg} border flex items-center justify-center text-xs font-bold ${color} mt-0.5 shrink-0`}
                >
                  {num}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{label}</h4>
                  <p className="text-muted-foreground text-sm font-light">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Visual */}
        <div className="p-8 rounded-2xl glass flex flex-col gap-3 shadow-[var(--glass-shadow)]">
          {[
            {
              label: "UI component",
              sub: "Dashboard / Form",
              color: "text-primary",
            },
            {
              label: "Server Action",
              sub: "Input validation + session check",
              color: "text-primary",
            },
            {
              label: "Service Logic",
              sub: "Orchestrating tenant operations",
              color: "text-accent",
            },
            {
              label: "Data Access Layer",
              sub: "Scoping queries by org_id",
              color: "text-primary",
            },
          ].map(({ label, sub, color }, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full p-4 rounded-xl glass-subtle text-center font-mono text-sm text-muted-foreground">
                <span className={color}>{label}</span>{" "}
                <span className="text-xs opacity-70">({sub})</span>
              </div>
              {i < 3 && <div className="w-px h-6 bg-[var(--glass-border)]" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
