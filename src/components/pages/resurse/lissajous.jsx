import { Button } from "../../Button";
import { useMathJaxTypesetRoot } from "@/hooks/useMathJaxTypesetRoot";

import simulatorLissajousImg from "/res/screenshots/Lissajous_Screenshot.png";
import simulatorGraficeBasicImg from "/res/screenshots/Grafice_Basic_Screenshot.png";
import Layout from "../../Layout";
import SEO from "../../SEO";
import { useI18n } from "@/i18n/LanguageContext";

const LissajousPage = () => {
	const { t, localizedPath, lang } = useI18n();
	const mathRootRef = useMathJaxTypesetRoot();
	const lissajousImages = [
		{ src: simulatorLissajousImg, alt: t("resourcesPage.lessonPages.lissajous.altMain", "Figuri Lissajous") },
		{ src: simulatorGraficeBasicImg, alt: t("resourcesPage.lessonPages.lissajous.altGraph", "Grafice Lissajous") },
	];

	const viewSimulation = t("resourcesPage.lessonPages.common.viewSimulation", "Vezi simularea");

	const variablesNote =
		lang === "en" ? (
			t(
				"resourcesPage.lessonPages.lissajous.variablesNote",
				"unde A₁ și A₂ sunt amplitudinile, ω₁ și ω₂ sunt frecvențele, iar φ este diferența de fază."
			)
		) : (
			<>
				unde <strong>A₁</strong> și <strong>A₂</strong> sunt amplitudinile, <strong>ω₁</strong> și <strong>ω₂</strong> sunt
				frecvențele, iar <strong>φ</strong> este diferența de fază.
			</>
		);

	return (
		<Layout>
			<SEO
				title={t("resourcesPage.lessonPages.lissajous.seo.title", "Resurse Figuri Lissajous | Curbe parametrice - PULS")}
				description={t(
					"resourcesPage.lessonPages.lissajous.seo.description",
					"Învață despre figurile Lissajous, ecuațiile parametrice și aplicațiile în fizică. Teorie, formule și simulări."
				)}
				keywords={t(
					"resourcesPage.lessonPages.lissajous.seo.keywords",
					"Lissajous, figuri Lissajous, oscilații perpendiculare, curbe parametrice"
				)}
				image="/res/icons/New-logo.png"
			/>
			<div className="resurse-pagina min-h-screen flex flex-col">
				<div className="resurse-page-container">
					<main ref={mathRootRef} className="flex-grow container mx-auto px-4 py-10 tex2jax_process">
						<h1 className="text-4xl md:text-5xl font-bold mb-6">
							{t("resourcesPage.lessonPages.lissajous.title", "Figuri Lissajous")}
						</h1>
						<div className="max-w-3xl mb-10">
							<p className="text-lg text-muted-foreground mb-4">
								{t(
									"resourcesPage.lessonPages.lissajous.p1",
									"Două oscilații sunt folosite pentru a produce un grafic numit curbă Lissajous (pronunțată Liss-uh-joo). O oscilație determină coordonata x, iar cealaltă oscilație determină coordonata y pe grafic. Curbă Lissajous este o figură care arată cum se schimbă cele două oscilații în timp."
								)}
							</p>
							<p className="text-lg text-muted-foreground mb-4">
								{t(
									"resourcesPage.lessonPages.lissajous.p2",
									"Când raportul frecvențelor oscilațiilor este un număr rațional (adică exprimabil ca numere întregi a/b), curba este închisă; se învârte înapoi în buclă. Rapoarte diferite produc forme diferite."
								)}
							</p>
							<p className="text-lg text-muted-foreground mb-4">
								{t(
									"resourcesPage.lessonPages.lissajous.p3",
									"Figurile Lissajous sunt curbe plane care descriu mișcarea résultată din combinarea a două oscilații sinusoidale perpendiculare, cu frecvențe și faze diferite."
								)}
							</p>
							<p className="text-lg text-muted-foreground mb-4">
								{t(
									"resourcesPage.lessonPages.lissajous.p4",
									"Aceste figuri sunt denumite după Jules Antoine Lissajous, care le-a studiat în secolul al XIX-lea."
								)}
							</p>
							<p className="text-lg text-muted-foreground mb-4">
								{t(
									"resourcesPage.lessonPages.lissajous.p5",
									"Ele sunt reprezentate grafic prin ecuații parametrice și pot fi observate pe osciloscoape atunci când două semnale electrice sunt aplicate la axe perpendiculare."
								)}
							</p>
							<p className="text-lg text-muted-foreground">
								{t(
									"resourcesPage.lessonPages.lissajous.p6",
									"Aceste figuri sunt folosite pentru a studia relațiile de frecvență și fază dintre două semnale și apar frecvent pe osciloscoape."
								)}
							</p>
						</div>
						<div className="space-y-12">
							<div className="rounded-container">
								<h2 className="text-2xl font-bold mb-4">
									{t("resourcesPage.lessonPages.lissajous.examplesTitle", "Exemple de figuri Lissajous")}
								</h2>
								<p className="text-muted-foreground mb-6">
									{t(
										"resourcesPage.lessonPages.lissajous.examplesP",
										"Forma figurii depinde de raportul frecvențelor și de diferența de fază dintre cele două oscilații."
									)}
								</p>
								<div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
									<img
										src={lissajousImages[0].src}
										alt={lissajousImages[0].alt}
										className="w-full h-full object-contain mx-auto my-auto"
									/>
								</div>
								<div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
									<div>
										<h3 className="text-xl font-semibold mb-2">
											{t("resourcesPage.lessonPages.lissajous.parametricHeading", "Ecuațiile parametrice:")}
										</h3>
										<div className="formula-resurse text-lg font-mono">
											{"\\( x(t) = A_1 \\cdot \\sin(\\omega_1 \\cdot t) \\)"}
											<br />
											{"\\( y(t) = A_2 \\cdot \\sin(\\omega_2 \\cdot t + \\phi) \\)"}
										</div>
										<p className="text-muted-foreground mt-2">{variablesNote}</p>
									</div>
									<a
										href={localizedPath("/simulare/figuri-lissajous")}
										rel="noopener noreferrer"
										className="resurse-link"
									>
										<Button size="lg">{viewSimulation}</Button>
									</a>
								</div>
							</div>
							<div className="rounded-container">
								<h2 className="text-2xl font-bold mb-4">
									{t("resourcesPage.lessonPages.lissajous.graphSectionTitle", "Grafic de figuri Lissajous")}
								</h2>
								<p className="text-muted-foreground mb-6">
									{t(
										"resourcesPage.lessonPages.lissajous.graphSectionP",
										"Acest grafic arată cum se schimbă coordonatele x și y în timp cu ajutorul ecuațiilor parametrice. Poți observa cum diferite rapoarte de frecvență și fază afectează forma figurii."
									)}
								</p>
								<div className="image-slider h-64 md:h-80 relative flex items-center justify-center mb-8">
									<img
										src={lissajousImages[1].src}
										alt={lissajousImages[1].alt}
										className="w-full h-full object-contain mx-auto my-auto"
									/>
								</div>
								<div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
									<div>
										<h3 className="text-xl font-semibold mb-2">
											{t("resourcesPage.lessonPages.lissajous.parametricHeading", "Ecuațiile parametrice:")}
										</h3>
										<div className="formula-resurse text-lg font-mono">
											{"\\( x(t) = A_1 \\cdot \\sin(\\omega_1 \\cdot t) \\)"}
											<br />
											{"\\( y(t) = A_2 \\cdot \\sin(\\omega_2 \\cdot t + \\phi) \\)"}
										</div>
										<p className="text-muted-foreground mt-2">{variablesNote}</p>
									</div>
									<a
										href={localizedPath("/simulare/grafice-simple")}
										rel="noopener noreferrer"
										className="resurse-link"
									>
										<Button size="lg">{viewSimulation}</Button>
									</a>
								</div>
							</div>
						</div>
					</main>
				</div>
			</div>
		</Layout>
	);
};

export default LissajousPage;
