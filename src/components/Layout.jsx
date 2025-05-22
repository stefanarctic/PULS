import Footer from "./Footer";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            {children}
            {/* <header id="home">
                <main>
                    {children}
                </main>
            </header> */}
            <Footer />
        </>
    );
}
 
export default Layout;