import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/button";
import "@/scss/components/_simulari-pages.scss";
import MathJaxRender from "@/components/MathJaxRender";

import simulatorLissajousImg from "../../../public/res/screenshots/Lissajous_Screenshot.png";
import simulatorGraficeBasicImg from "../../../public/res/screenshots/Grafice_Basic_Screenshot.png";

const LissajousPage = () => {
	const lissajousImages = [
		{ src: simulatorLissajousImg, alt: "Figuri Lissajous" },
		{ src: simulatorGraficeBasicImg, alt: "Grafice Lissajous" },
	];

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<div
				style={{
					paddingTop: "110px",
					flex: 1,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<main className="flex-grow container mx-auto px-4 py-10">
					<h1 className="text-4xl md:text-5xl font-bold mb-6">
						Figuri Lissajous
					</h1>
					<div className="max-w-3xl mb-10">
						<p className="text-lg text-muted-foreground mb-4">
							Două oscilații sunt folosite pentru a produce un grafic numit curbă
							Lissajous (pronunțată Liss-uh-joo). O oscilație determină
							coordonata x, iar cealaltă oscilație determină coordonata y pe
							grafic. Curbă Lissajous este o figură care arată cum se schimbă
							cele două oscilații în timp.
						</p>
						<p className="text-lg text-muted-foreground mb-4">
							Când raportul frecvențelor oscilațiilor este un număr rațional
							(adică exprimabil ca numere întregi a/b), curba este închisă; se
							învârte înapoi în buclă. Rapoarte diferite produc forme
							diferite.
						</p>
						<p className="text-lg text-muted-foreground mb-4">
							Figurile Lissajous sunt curbe plane care descriu mișcarea
							résultată din combinarea a două oscilații sinusoidale
							perpendiculare, cu frecvențe și faze diferite.
						</p>
						<p className="text-lg text-muted-foreground mb-4">
							Aceste figuri sunt denumite după Jules Antoine Lissajous, care
							le-a studiat în secolul al XIX-lea.
						</p>
						<p className="text-lg text-muted-foreground mb-4">
							Ele sunt reprezentate grafic prin ecuații parametrice și pot fi
							observate pe osciloscoape atunci când două semnale electrice
							sunt aplicate la axe perpendiculare.
						</p>
						<p className="text-lg text-muted-foreground">
							Aceste figuri sunt folosite pentru a studia relațiile de
							frecvență și fază dintre două semnale și apar frecvent pe
							osciloscoape.
						</p>
					</div>
					<div className="space-y-12">
						<div className="rounded-container">
							<h2 className="text-2xl font-bold mb-4">
								Exemple de figuri Lissajous
							</h2>
							<p className="text-muted-foreground mb-6">
								Forma figurii depinde de raportul frecvențelor și de diferența
								de fază dintre cele două oscilații.
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
										Ecuațiile parametrice:
									</h3>
									<div className="text-lg font-mono">
										{"\\( x(t) = A_1 \\cdot \\sin(\\omega_1 \\cdot t) \\)"}
										<MathJaxRender />
										<br />
										{"\\( y(t) = A_2 \\cdot \\sin(\\omega_2 \\cdot t + \\phi) \\)"}
										<MathJaxRender />
									</div>
									<p className="text-muted-foreground mt-2">
										unde <strong>A₁</strong> și <strong>A₂</strong> sunt amplitudinile,
										<strong>ω₁</strong> și <strong>ω₂</strong> sunt frecvențele, iar
										<strong>φ</strong> este diferența de fază.
									</p>
								</div>
								<Button size="lg">Începe simularea</Button>
							</div>
						</div>
						<div className="rounded-container">
							<h2 className="text-2xl font-bold mb-4">
								Grafic de figuri Lissajous
							</h2>
							<p className="text-muted-foreground mb-6">
								Acest grafic arată cum se schimbă coordonatele x și y în timp
								cu ajutorul ecuațiilor parametrice. Poți observa cum diferite
								rapoarte de frecvență și fază afectează forma figurii.
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
										Ecuațiile parametrice:
									</h3>
									<div className="text-lg font-mono">
										{"\\( x(t) = A_1 \\cdot \\sin(\\omega_1 \\cdot t) \\)"}
										<MathJaxRender />
										<br />
										{"\\( y(t) = A_2 \\cdot \\sin(\\omega_2 \\cdot t + \\phi) \\)"}
										<MathJaxRender />
									</div>
									<p className="text-muted-foreground mt-2">
										unde <strong>A₁</strong> și <strong>A₂</strong> sunt amplitudinile,
										<strong>ω₁</strong> și <strong>ω₂</strong> sunt frecvențele, iar
										<strong>φ</strong> este diferența de fază.
									</p>
								</div>
								<Button size="lg">Începe simularea</Button>
							</div>
							
						</div>
					</div>
				</main>
				<Footer />
			</div>
		</div>
	);
};

export default LissajousPage;