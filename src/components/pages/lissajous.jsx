import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageSlider from "@/components/ImageSlider";
import { Button } from "@/components/button";
import "@/scss/components/_simulari-pages.scss";

const lissajousImages = [
	{
		src: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Lissajous_figure_1_2.png",
		alt: "Lissajous figura 1:2",
	},
	{
		src: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Lissajous_figure_3_2.png",
		alt: "Lissajous figura 3:2",
	},
	{
		src: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Lissajous_figure_5_4.png",
		alt: "Lissajous figura 5:4",
	},
];

const LissajousPage = () => {
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
							Figurile Lissajous sunt curbe plane care descriu mișcarea rezultată
							din combinarea a două oscilații sinusoidale perpendiculare, cu
							frecvențe și faze diferite.
						</p>
						<p className="text-lg text-muted-foreground">
							Aceste figuri sunt folosite pentru a studia relațiile de frecvență
							și fază dintre două semnale și apar frecvent pe osciloscoape.
						</p>
					</div>
					<div className="space-y-12">
						<div className="rounded-container">
							<h2 className="text-2xl font-bold mb-4">
								Exemple de figuri Lissajous
							</h2>
							<p className="text-muted-foreground mb-6">
								Forma figurii depinde de raportul frecvențelor și de diferența de
								fază dintre cele două oscilații.
							</p>
							<ImageSlider images={lissajousImages} />
							<div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
								<div>
									<h3 className="text-xl font-semibold mb-2">
										Ecuațiile parametrice:
									</h3>
									<div className="text-lg font-mono">
										x(t) = A · sin(a·t + δ)
										<br />
										y(t) = B · sin(b·t)
									</div>
									<p className="text-muted-foreground mt-2">
										unde A și B sunt amplitudinile, a și b sunt frecvențele, iar δ
										este diferența de fază.
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