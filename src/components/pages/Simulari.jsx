import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { simulationsConfig } from "@/data/simulations";

const SimulariPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="simulari-page">
        <main className="main-content">
          <h1>Simulări</h1>
          <p>Explorează concepte fizice prin intermediul simulărilor interactive.</p>

          <div className="simulations-grid">
            {simulationsConfig.map((simulation) => (
              <div key={simulation.id} className="simulation-card" onClick={() => {
                if (simulation.route) {
                  navigate(simulation.route);
                } else if (simulation.iframeSrc) {
                  window.open(simulation.iframeSrc, "_blank");
                }
              }}>
                <div className="card-content">
                  <h2>{simulation.title}</h2>
                  <p className="description">{simulation.description}</p>
                </div>
                <div className="image-container">
                  <div className="card-image active">
                    <img
                      src={simulation.image}
                      alt={simulation.caption}
                    />
                    <div className="caption">
                      {simulation.caption}
                    </div>
                  </div>
                </div>
                <button
                  className="start-simulation-btn"
                  onClick={() => {
                    if (simulation.route) {
                      navigate(simulation.route);
                    } else if (simulation.iframeSrc) {
                      window.open(simulation.iframeSrc, "_blank");
                    }
                  }}
                >
                  Începe simularea
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default SimulariPage;
