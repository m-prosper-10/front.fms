import { Button } from "../../components/button";
import { appConfig } from "../../lib/config";

export function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">React + Vite baseline</p>
        <h1>{appConfig.appName}</h1>
        <p>{appConfig.description}</p>
        <div className="actions">
          <Button>Open dashboard</Button>
        </div>
      </section>
    </main>
  );
}
