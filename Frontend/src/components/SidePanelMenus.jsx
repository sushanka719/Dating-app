import { Link } from 'react-router-dom';
import styles from '../styles/SideBar.module.css';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/reducers/authSlice';

const SidePanelMenus = () => {
    const dispatch = useDispatch();

    function logoutHandler() {
        dispatch(logoutUser());
    }
    return (
        <div>
            <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                    <Link to="editProfile" className={styles.link}>Edit Profile</Link>
                </li>
                <li className={styles.menuItem}>
                    <Link to="settings" className={styles.link}>Settings</Link>
                </li>
                <li className={styles.menuItem}>
                    <Link to="contacts" className={styles.link}>Contact and FAQs</Link>
                </li>
                <button className={styles.menuItem} onClick={logoutHandler}>
                    Logout
                </button>
            </ul>
        </div>
    );
};

export default SidePanelMenus;
