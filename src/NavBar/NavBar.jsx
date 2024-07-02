import './NavBar.css';
import logo from '../Images/Logo.png';
import phoneIcon from '../Images/fullwhitephone.png';
import mailIcon from '../Images/icons8-email-24.png';
import arrowDownIcon from '../Images/arrowDown.png';
import greenArrowDownIcon from '../Images/greenArrowDown.png'
import { Link } from 'react-router-dom';
import { useState } from 'react';

function NavBar() {
    const [navActive, setNavActive] = useState(false);

    // Toggle the visibility of the dropdown
    const toggleNavButtons = () => {
        setNavActive(!navActive);
    };

    return (
        <>
            <div className='navButtons'>
                

                <div className={`secondaryButtons ${navActive ? 'active' : ''}`}>
                    <Link to="/"><button className='namaiButton'>Kalendorius</button></Link>
                </div>
                <button onClick={toggleNavButtons} className={`dropdownToggle ${navActive ? 'rotate' : ''}`}>
                    <img className="arrowDown" src={greenArrowDownIcon} alt="Toggle Dropdown" />
                </button>
            </div>
        </>
    );
}

export default NavBar;