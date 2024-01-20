import NavbarPage from "./Componets/Navbar.jsx";
import { Outlet } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

    return (
        <>
            <NavbarPage></NavbarPage>
            <Outlet></Outlet>
        </>
    );
}

export default App;