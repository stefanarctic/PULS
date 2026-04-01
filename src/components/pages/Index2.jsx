import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  BookOpen,
  Eye,
  CheckCircle2,
  Sparkles,
  Bot,
  Gamepad2,
  Library,
  Users,
  Quote,
  ArrowRight,
  Zap,
  Clock,
  Brain,
  MessageCircle,
  Send,
} from "lucide-react";
import Layout from "../Layout";
import Slideshow from "../Slideshow";
import SEO from "../SEO";
import "./Index2.css";

const GUIDES_ENTRY = "/resurse";

const Index2 = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "PULS - Ghiduri BAC Fizică & simulări",
    description:
      "Ghiduri scurte pentru BAC, simulări interactive, probleme reale și asistent AI pentru fizică.",
    url: "https://puls-fizica.ro",
    logo: "https://puls-fizica.ro/res/icons/New-logo.png",
    sameAs: ["https://github.com/Stefanarctic/PULS"],
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    const els = document.querySelectorAll(".i2 .hidden");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <Layout>
      <SEO
        title="PULS — Ia BAC-ul la fizică fără să te chinui | Ghiduri & simulări"
        description="Ghiduri scurte (~15 min) pe topicuri BAC, simulări interactive, probleme reale și AI care îți arată unde greșești. Vezi. Înțelegi. Aplici."
        keywords="bac fizică, ghiduri fizică, simulări fizică, probleme bac fizică, învățare fizică, PULS"
        image="/res/icons/New-logo.png"
        structuredData={structuredData}
      />

      <div className="i2">
        {/* ─── HERO ─── */}
        <header className="i2-hero">
          <div className="i2-hero-glow" aria-hidden />
          <div className="i2-hero-glow i2-hero-glow--2" aria-hidden />
          <div className="i2-wrap i2-hero-grid">
            <div className="i2-hero-copy hidden hidden-left">
              <span className="i2-badge">
                <Sparkles size={14} strokeWidth={2.5} />
                Vezi. Înțelegi. Aplici.
              </span>
              <h1>
                Ia BAC-ul la fizică <span className="i2-grad">fără să te chinui</span>
              </h1>
              <p className="i2-sub">
                Ghiduri scurte (~15 min) pe topicuri diferite, simulări interactive, probleme reale
                și AI care îți explică exact unde greșești.
              </p>
              <div className="i2-hero-btns">
                <Link to={GUIDES_ENTRY} className="i2-btn i2-btn--glow">
                  Începe primul ghid
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <a href="#i2-how" className="i2-btn i2-btn--outline">
                  Vezi cum funcționează
                </a>
              </div>
            </div>
            <div className="i2-hero-visual hidden hidden-bottom">
              <div className="i2-slideshow-frame">
                <Slideshow />
              </div>
            </div>
          </div>
        </header>

        {/* ─── STATS RIBBON ─── */}
        <div className="i2-ribbon hidden hidden-bottom">
          <div className="i2-wrap i2-ribbon-grid">
            <div className="i2-stat">
              <Zap size={20} strokeWidth={2} />
              <div>
                <strong>24+</strong>
                <span>simulări</span>
              </div>
            </div>
            <div className="i2-stat">
              <Clock size={20} strokeWidth={2} />
              <div>
                <strong>~15 min</strong>
                <span>per ghid</span>
              </div>
            </div>
            <div className="i2-stat">
              <Brain size={20} strokeWidth={2} />
              <div>
                <strong>AI</strong>
                <span>asistent</span>
              </div>
            </div>
            <div className="i2-stat">
              <BookOpen size={20} strokeWidth={2} />
              <div>
                <strong>8+</strong>
                <span>capitole</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── PROBLEM ─── */}
        <section className="i2-section" id="i2-problem">
          <div className="i2-wrap i2-center">
            <span className="i2-label hidden hidden-bottom">PROBLEMA</span>
            <h2 className="i2-title hidden hidden-bottom">
              Te chinui cu fizica pentru BAC?
            </h2>
            <div className="i2-pain-grid hidden hidden-bottom">
              {[
                "Nu înțelegi conceptele, doar le memorezi",
                "Problemele par complet diferite de teorie",
                "Nu știi dacă ai rezolvat corect",
                "Pierzi timp între YouTube, PDF-uri și culegeri",
              ].map((t) => (
                <div className="i2-pain-card" key={t}>
                  <span className="i2-pain-x">✕</span>
                  <p>{t}</p>
                </div>
              ))}
            </div>
            <p className="i2-accent-line hidden hidden-bottom">
              Nu ai nevoie de mai multe resurse. <strong>Ai nevoie de un sistem.</strong>
            </p>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="i2-section i2-section--dark" id="i2-how">
          <div className="i2-wrap i2-center">
            <span className="i2-label hidden hidden-bottom">CUM FUNCȚIONEAZĂ</span>
            <h2 className="i2-title hidden hidden-bottom">
              PULS te duce <span className="i2-grad">pas cu pas</span> până înțelegi
            </h2>
            <div className="i2-steps">
              {[
                {
                  num: "01",
                  icon: <BookOpen size={26} strokeWidth={1.75} />,
                  title: "Înțelegi rapid",
                  desc: "Conceptele esențiale explicate clar, fără teorie inutilă — în sesiuni scurte, pe capitolele care contează la BAC.",
                },
                {
                  num: "02",
                  icon: <Eye size={26} strokeWidth={1.75} />,
                  title: "Vezi fenomenul",
                  desc: "Simulări interactive care îți arată exact cum funcționează fizica, nu doar pe hârtie.",
                },
                {
                  num: "03",
                  icon: <CheckCircle2 size={26} strokeWidth={1.75} />,
                  title: "Aplici și verifici",
                  desc: "Rezolvi probleme reale și primești feedback instant de la AI.",
                },
              ].map((s) => (
                <article className="i2-step hidden hidden-bottom" key={s.num}>
                  <span className="i2-step-num">{s.num}</span>
                  <div className="i2-step-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DIFFERENTIATOR ─── */}
        <section className="i2-section" id="i2-diff">
          <div className="i2-wrap i2-center" style={{ maxWidth: 700 }}>
            <span className="i2-label hidden hidden-bottom">DE CE PULS</span>
            <h2 className="i2-title hidden hidden-bottom">
              Nu mai înveți fizica <span className="i2-grad">pe de rost</span>
            </h2>
            <div className="i2-check-list hidden hidden-bottom">
              {[
                ["vezi ce se întâmplă", "nu doar citești"],
                ["înțelegi de ce", "nu doar cum"],
                ["aplici imediat", 'nu \u201Epoate mai t\u00E2rziu\u201D'],
              ].map(([a, b]) => (
                <div className="i2-check-row" key={a}>
                  <CheckCircle2 size={20} strokeWidth={2} className="i2-check-icon" />
                  <span>
                    <strong>{a}</strong>, {b}
                  </span>
                </div>
              ))}
            </div>
            <p className="i2-accent-line hidden hidden-bottom" style={{ marginTop: "1.5rem" }}>
              Așa rămâne.
            </p>
          </div>
        </section>

        {/* ─── AI ─── */}
        <section className="i2-section i2-section--dark" id="i2-ai">
          <div className="i2-wrap i2-ai-layout">
            <div className="i2-ai-copy hidden hidden-left">
              <span className="i2-label">ASISTENT AI</span>
              <h2 className="i2-title i2-title--left">
                Ai profesor personal, <span className="i2-grad">24/7</span>
              </h2>
              <div className="i2-check-list">
                {[
                  "îți explică exact unde greșești",
                  "îți analizează rezolvarea",
                  "îți arată pașii corecți",
                ].map((t) => (
                  <div className="i2-check-row" key={t}>
                    <CheckCircle2 size={18} strokeWidth={2} className="i2-check-icon" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              <p className="i2-ai-punchline">Nu doar îți dă răspunsul. Te face să înțelegi.</p>
              <Link to="/asistent" className="i2-btn i2-btn--outline" style={{ marginTop: "0.5rem" }}>
                Deschide asistentul <ArrowRight size={15} />
              </Link>
            </div>
            <div className="i2-ai-visual hidden hidden-bottom">
              <div className="i2-chat-mock">
                <div className="i2-chat-bubble i2-chat-user">
                  <MessageCircle size={14} />
                  <span>De ce forța e negativă la oscilații?</span>
                </div>
                <div className="i2-chat-bubble i2-chat-ai">
                  <Bot size={14} />
                  <span>
                    Forța de revenire acționează mereu în sens opus deplasării. Când corpul e la dreapta
                    echilibrului, forța îl trage spre stânga — de aceea e negativă.
                  </span>
                </div>
                <div className="i2-chat-input">
                  <span>Scrie o întrebare…</span>
                  <Send size={14} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SIMULATIONS ─── */}
        <section className="i2-section" id="i2-sim">
          <div className="i2-wrap i2-center">
            <span className="i2-label hidden hidden-bottom">SIMULĂRI</span>
            <h2 className="i2-title hidden hidden-bottom">
              Vezi fizica <span className="i2-grad">în acțiune</span>
            </h2>
            <div className="i2-check-list hidden hidden-bottom" style={{ maxWidth: 520, margin: "0 auto" }}>
              {[
                "modifici parametri în timp real",
                "vezi efectele instant",
                "înțelegi concepte abstracte vizual",
              ].map((t) => (
                <div className="i2-check-row" key={t}>
                  <CheckCircle2 size={18} strokeWidth={2} className="i2-check-icon" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <p className="i2-accent-line hidden hidden-bottom" style={{ marginTop: "1.5rem" }}>
              Asta face diferența.
            </p>
            <div className="i2-cta-row hidden hidden-bottom">
              <Link to="/simulari" className="i2-btn i2-btn--glow">
                <Gamepad2 size={18} strokeWidth={2} />
                Explorează simulările
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── CONTENT ─── */}
        <section className="i2-section i2-section--dark" id="i2-content">
          <div className="i2-wrap i2-center">
            <span className="i2-label hidden hidden-bottom">CONȚINUT</span>
            <h2 className="i2-title hidden hidden-bottom">
              Exact ce ai nevoie <span className="i2-grad">pentru BAC</span>
            </h2>
            <div className="i2-content-grid hidden hidden-bottom">
              {[
                { icon: <BookOpen size={22} />, text: "Capitole complete — mecanică, oscilații, electricitate și altele" },
                { icon: <Zap size={22} />, text: <>Probleme reale din examene — <Link to="/probleme/bac" className="i2-ilink">subiecte BAC</Link></> },
                { icon: <Brain size={22} />, text: <>Grile + autoevaluare — <Link to="/probleme/grile" className="i2-ilink">antrenament rapid</Link></> },
                { icon: <Eye size={22} />, text: <>Progres urmărit în <Link to="/profil" className="i2-ilink">profilul tău</Link></> },
              ].map((item, i) => (
                <div className="i2-content-card" key={i}>
                  <div className="i2-content-icon">{item.icon}</div>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
            <div className="i2-cta-row hidden hidden-bottom">
              <Link to="/probleme" className="i2-btn i2-btn--outline">
                Vezi problemele <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── CLASSES ─── */}
        <section className="i2-section" id="i2-classes">
          <div className="i2-wrap i2-center">
            <span className="i2-label hidden hidden-bottom">CLASE</span>
            <h2 className="i2-title hidden hidden-bottom">
              Profesorii pot lucra <span className="i2-grad">direct cu tine</span>
            </h2>
            <div className="i2-class-grid hidden hidden-bottom">
              {[
                { icon: <Users size={24} />, text: "teme și exerciții directe" },
                { icon: <Library size={24} />, text: "feedback pe loc" },
                { icon: <CheckCircle2 size={24} />, text: "progres vizibil" },
              ].map((c, i) => (
                <div className="i2-class-card" key={i}>
                  {c.icon}
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
            <div className="i2-cta-row hidden hidden-bottom">
              <Link to="/clasa" className="i2-btn i2-btn--outline">Clasa mea</Link>
              <Link to="/clasa/intra" className="i2-btn i2-btn--glow">
                Intră cu codul clasei <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIAL ─── */}
        <section className="i2-section i2-section--dark" id="i2-social">
          <div className="i2-wrap i2-center">
            <span className="i2-label hidden hidden-bottom">TESTIMONIALE</span>
            <h2 className="i2-title hidden hidden-bottom">
              Elevii încep să învețe <span className="i2-grad">altfel</span>
            </h2>
            <blockquote className="i2-quote hidden hidden-bottom">
              <Quote className="i2-quote-mark" size={32} strokeWidth={1.25} aria-hidden />
              <p>
                Pentru prima dată chiar am înțeles subiectele la fizică, nu doar le-am învățat pe de
                rost.
              </p>
              <footer className="i2-quote-author">
                <div className="i2-avatar">E</div>
                <div>
                  <strong>Elev clasa a XII-a</strong>
                  <span>Utilizator PULS</span>
                </div>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="i2-final" id="i2-final">
          <div className="i2-final-glow" aria-hidden />
          <div className="i2-wrap i2-center">
            <h2 className="i2-title hidden hidden-bottom">
              Nu mai pierde timpul. <span className="i2-grad">Începe acum.</span>
            </h2>
            <p className="i2-final-sub hidden hidden-bottom">Primul ghid te așteaptă.</p>
            <div className="i2-hero-btns i2-hero-btns--center hidden hidden-bottom">
              <Link to={GUIDES_ENTRY} className="i2-btn i2-btn--glow i2-btn--lg">
                Începe cu un ghid scurt
                <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
            </div>
            <p className="i2-badge i2-badge--footer hidden hidden-bottom">
              <Sparkles size={14} strokeWidth={2.5} />
              Vezi. Înțelegi. Aplici.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index2;
